import { Router, type Request } from 'express';
import { currentUser } from '../auth/middleware.js';
import { HttpError } from '../lib/errors.js';
import { parseBody, queryText } from '../lib/validation.js';
import {
  changeListWorks,
  countByList,
  createList,
  deleteList,
  getLists,
  changeList,
  getSaved,
  saveList,
  unsaveList,
} from './repository.js';
import {
  listChangeSchema,
  newListSchema,
  listWorksSchema,
  savedListSchema,
} from './schemas.js';
import { searchSharedLists, sharedList } from './shared.js';

// The reader's own lists of books, and other readers' public ones to find
// and open (shared.ts). Mounted behind requireUser.
export const listsRouter = Router();

const me = (req: Request) => currentUser(req)._id;

const TAKEN = 'You have a list by that name.';
const nameTaken = () =>
  new HttpError(409, 'list_name_taken', TAKEN, { name: TAKEN });

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
  const { name, public: open } = parseBody(newListSchema, req.body);
  const list = await createList(me(req), name, open);
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

// Renamed, or made public or private
listsRouter.patch('/:id', async (req, res) => {
  const change = parseBody(listChangeSchema, req.body);
  const result = await changeList(me(req), req.params.id, change);
  if (result === 'missing') throw noSuchList();
  if (result === 'taken') throw nameTaken();
  res.json(await everything(req));
});

listsRouter.delete('/:id', async (req, res) => {
  if (!(await deleteList(me(req), req.params.id))) throw noSuchList();
  res.json(await everything(req));
});

// Books from the catalogue put in the list or taken out, the shelves as
// they were
listsRouter.patch('/:id/works', async (req, res) => {
  const { add, remove } = parseBody(listWorksSchema, req.body);
  const result = await changeListWorks(me(req), req.params.id, add, remove);
  if (result === 'missing') throw noSuchList();
  if (result === 'full')
    throw new HttpError(
      409,
      'list_full',
      'That’s a lot of books for one list. Take some out first.',
    );
  res.json(await everything(req));
});
