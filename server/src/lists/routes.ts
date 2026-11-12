import { Router, type Request } from 'express';
import { currentUser } from '../auth/middleware.js';
import { HttpError } from '../lib/errors.js';
import { parseBody, queryText } from '../lib/validation.js';
import {
  changeListWorks,
  createList,
  deleteList,
  getLists,
  changeList,
  WANT_LIST,
} from './repository.js';
import { countByList } from './counts.js';
import { getSaved, saveList, unsaveList } from './saved.js';
import { wantAll } from './wanted.js';
import { changeTyped, putTyped } from './typed.js';
import { TYPED_KEY } from './typedKey.js';
import { wantedBookSchema } from '../books/schemas.js';
import {
  listChangeSchema,
  newListSchema,
  listWorksSchema,
  savedListSchema,
  wantedSchema,
} from './schemas.js';
import { rememberNamed } from '../catalogue/repository.js';
import { workOf, worksByIsbns } from '../lookup/byIsbn.js';
import { searchSharedLists, sharedList } from './shared.js';

// The reader's own lists of books, and other readers' public ones to find
// and open (shared.ts). Mounted behind requireUser.
export const listsRouter = Router();

const me = (req: Request) => currentUser(req)._id;

const TAKEN = 'You have a list by that name.';
const nameTaken = () =>
  new HttpError(409, 'list_name_taken', TAKEN, { name: TAKEN });

// Want to read stays as it is: emptied, never renamed or removed
const keptList = () =>
  new HttpError(
    400,
    'list_kept',
    'Want to read stays. Take books out of it instead.',
  );

const listFull = () =>
  new HttpError(
    409,
    'list_full',
    'That’s a lot of books for one list. Take some out first.',
  );

const noSuchList = () =>
  new HttpError(404, 'list_not_found', 'That list isn’t there any more.');

// Every list, with how many books are in each
const everything = async (req: Request) => {
  const lists = await getLists(me(req));
  return { lists, counts: await countByList(me(req), lists) };
};

listsRouter.get('/', async (req, res) => {
  res.json(await everything(req));
});

listsRouter.post('/', async (req, res) => {
  const {
    name,
    public: open,
    description,
  } = parseBody(newListSchema, req.body);
  const list = await createList(me(req), name, open, description);
  if (!list)
    throw new HttpError(
      409,
      'too_many_lists',
      'That’s a lot of lists. Remove one first.',
    );
  res.status(201).json({ list, ...(await everything(req)) });
});

// Other readers' public lists by name
listsRouter.get('/shared', async (req, res) => {
  const query = queryText(req, 'q', 100);
  res.json({
    lists: query.length < 2 ? [] : await searchSharedLists(query, me(req)),
  });
});

// One public list, its books as any reader may see them
listsRouter.get('/shared/:id', async (req, res) => {
  const list = await sharedList(req.params.id);
  if (!list) throw noSuchList();
  res.json({ list });
});

// Other readers' lists kept to come back to: all of them, one kept (or
// kept afresh), and one let go
listsRouter.get('/saved', async (req, res) => {
  res.json({ saved: await getSaved(me(req)) });
});
listsRouter.put('/saved', async (req, res) => {
  const list = parseBody(savedListSchema, req.body);
  if (!(await saveList(me(req), list)))
    throw new HttpError(
      409,
      'too_many_saved',
      'That’s a lot of lists kept. Let one go first.',
    );
  res.json({ saved: await getSaved(me(req)) });
});
listsRouter.delete('/saved', async (req, res) => {
  await unsaveList(
    me(req),
    queryText(req, 'kind', 20),
    queryText(req, 'ref', 200),
  );
  res.json({ saved: await getSaved(me(req)) });
});

// Renamed, made public or private, or said something else of
listsRouter.patch('/:id', async (req, res) => {
  const change = parseBody(listChangeSchema, req.body);
  if (req.params.id === WANT_LIST && change.name !== undefined)
    throw keptList();
  const result = await changeList(me(req), req.params.id, change);
  if (result === 'missing') throw noSuchList();
  if (result === 'taken') throw nameTaken();
  res.json(await everything(req));
});

listsRouter.delete('/:id', async (req, res) => {
  if (req.params.id === WANT_LIST) throw keptList();
  if (!(await deleteList(me(req), req.params.id))) throw noSuchList();
  res.json(await everything(req));
});

// Books the reader wants to read, brought over from another site a few at
// a time: each found in the catalogue by its ISBN and put in Want to read
// (their own copy marked, if they have one), or, not found, put in as the
// file has it. How many went in, and how many of those as they were.
listsRouter.post('/want-to-read/import', async (req, res) => {
  const { books, importId } = parseBody(wantedSchema, req.body);
  // The whole batch looked up at once, and put in at once
  const found = await worksByIsbns(books.map((entry) => entry.isbn));
  // Those Open Library didn't know, kept by name in alcove's catalogue
  await rememberNamed(books.filter((entry) => !workOf(found, entry.isbn)));
  res.json(
    await wantAll(
      me(req),
      books.map((entry) => ({ entry, work: workOf(found, entry.isbn) })),
      importId,
    ),
  );
});

// A book the catalogue doesn't have, typed in by hand, put in the list;
// with its key
listsRouter.post('/:id/typed', async (req, res) => {
  const result = await putTyped(
    me(req),
    req.params.id,
    parseBody(wantedBookSchema, req.body),
  );
  if (result === 'missing') throw noSuchList();
  if (result === 'full') throw listFull();
  res.status(201).json({ ...(await everything(req)), ...result });
});

// One typed in, changed, in every list it's in
listsRouter.put('/typed/:key', async (req, res) => {
  const key = req.params.key;
  const book = parseBody(wantedBookSchema, req.body);
  if (!TYPED_KEY.test(key) || !(await changeTyped(me(req), key, book)))
    throw new HttpError(
      404,
      'typed_not_found',
      'That book isn’t in your lists any more.',
    );
  res.json(await everything(req));
});

// Books from the catalogue put in the list or taken out, the shelves as
// they were
listsRouter.patch('/:id/works', async (req, res) => {
  const { add, remove } = parseBody(listWorksSchema, req.body);
  const result = await changeListWorks(me(req), req.params.id, add, remove);
  if (result === 'missing') throw noSuchList();
  if (result === 'full') throw listFull();
  res.json(await everything(req));
});
