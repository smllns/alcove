import { Router, type Request } from 'express';
import { currentUser } from '../auth/middleware.js';
import { HttpError } from '../lib/errors.js';
import { objectIdOr, parseBody } from '../lib/validation.js';
import { getLists, ownLists, WANT_LIST } from '../lists/repository.js';
import { takeWanted } from '../lists/wanted.js';
import { takeTyped } from '../lists/typed.js';
import { warmListsOfWork } from '../lookup/workLists.js';
import { getPlaces, resolvePlace } from '../places/repository.js';
import { storedCoverSources, type BookDoc } from '../db.js';
import { deleteCover, discardCover } from '../uploads/storage.js';
import {
  addBook,
  countBooks,
  deleteBook,
  findBook,
  findSameBook,
  listBooks,
  ownCopies,
  toPublicBook,
  updateBook,
} from './repository.js';
import { addBookSchema, bookInputSchema, type BookInput } from './schemas.js';
import { rememberAdded, rememberChanged } from '../catalogue/repository.js';
import { begun } from './copy.js';
import { withShared } from './fromReaders.js';
import { importsRouter } from './imports.js';

// A reader's own books. Mounted behind requireUser.
export const booksRouter = Router();
// Books brought over from another site, before the routes by id
booksRouter.use(importsRouter);

const me = (req: Request) => currentUser(req)._id;

const notOnShelves = () =>
  new HttpError(404, 'not_found', 'That book isn’t on your shelves.');

const objectId = (value: unknown) => objectIdOr(value, notOnShelves);

// The question the form asks before adding a second copy
const alreadyShelved = (book: { title: string; createdAt: Date }) => {
  const added = book.createdAt.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  return new HttpError(
    409,
    'already_shelved',
    `“${book.title}” is already on your shelves, added ${added}.`,
  );
};

booksRouter.get('/', async (req, res) => {
  const limit = Math.min(Math.max(Number(req.query.limit) || 48, 1), 100);
  const after = req.query.after ? objectId(req.query.after) : undefined;
  const [page, total] = await Promise.all([
    listBooks(me(req), { limit, after }),
    countBooks(me(req)),
  ]);
  res.json({
    books: page.items.map(toPublicBook),
    nextCursor: page.nextCursor,
    total,
  });
});

// Only places and lists the reader actually has; anything stale is
// trimmed away
async function ownRefsOnly<T extends BookInput>(req: Request, input: T) {
  const place = input.copy?.place;
  const [homes, lists] = await Promise.all([
    place && getPlaces(me(req)),
    input.lists.length > 0 && getLists(me(req)),
  ]);
  if (place && homes) input.copy!.place = resolvePlace(homes, place);
  if (lists) input.lists = ownLists(lists, input.lists);
  return unwanted(input);
}

// A book begun or read is no longer one to read next: out of Want to read
const unwanted = <T extends BookInput>(input: T) =>
  begun(input.copy?.reading)
    ? { ...input, lists: input.lists.filter((id) => id !== WANT_LIST) }
    : input;

// A copy added of a book wanted from the catalogue: it stays wanted, now
// as the reader's own, until it's read
async function claimWanted<T extends BookInput>(
  req: Request,
  input: T,
  typed?: string,
) {
  if (typed) return claimTyped(req, input, typed);
  const work = input.openLibrary?.work;
  if (!work || !(await takeWanted(me(req), work))) return input;
  return unwanted({
    ...input,
    lists: [...new Set([...input.lists, WANT_LIST])],
  });
}

// A copy added of a book typed into lists by hand: in those lists in its
// place
async function claimTyped<T extends BookInput>(
  req: Request,
  input: T,
  typed: string,
) {
  const ids = await takeTyped(me(req), typed);
  return unwanted({ ...input, lists: [...new Set([...input.lists, ...ids])] });
}

// Open Library is slow with a book's lists: asked for as soon as the book
// is added, or turned into another of the catalogue's, they're there by
// the time its page is opened
function warmLists(book: BookDoc, before?: BookDoc) {
  const work = book.openLibrary?.work;
  if (work && work !== before?.openLibrary?.work) warmListsOfWork(work);
}

booksRouter.post('/', async (req, res) => {
  const { anotherCopy, typed, ...asked } = await ownRefsOnly(
    req,
    parseBody(addBookSchema, req.body),
  );
  const input = await claimWanted(req, asked, typed);
  if (!anotherCopy) {
    const same = await findSameBook(me(req), input);
    if (same) throw alreadyShelved(same);
  }
  const book = await addBook(me(req), await withShared(input));
  warmLists(book);
  await rememberAdded([input]);
  res.status(201).json({ book: toPublicBook(book) });
});

// The reader's own copy of a work from the catalogue, if they have it
booksRouter.get('/by-work/:workKey', async (req, res) => {
  const workKey = String(req.params.workKey);
  const owned = await ownCopies(me(req), [workKey]);
  res.json({ bookId: owned.get(workKey)?.bookId ?? null });
});

booksRouter.get('/:id', async (req, res) => {
  const book = await findBook(me(req), objectId(req.params.id));
  if (!book) throw notOnShelves();
  res.json({ book: toPublicBook(book) });
});

booksRouter.put('/:id', async (req, res) => {
  const input = await ownRefsOnly(req, parseBody(bookInputSchema, req.body));
  const updated = await updateBook(me(req), objectId(req.params.id), input);
  if (!updated) throw notOnShelves();
  const { book, old } = updated;
  warmLists(book, old);
  await rememberChanged(input);
  // A cover of ours it no longer shows, unless another book still does
  if (old.cover && old.cover.url !== book.cover?.url)
    await discardCover(me(req), old.cover.url).catch(() => {});
  res.json({ book: toPublicBook(book) });
});

booksRouter.delete('/:id', async (req, res) => {
  const book = await deleteBook(me(req), objectId(req.params.id));
  if (!book) throw notOnShelves();
  if (book.cover && storedCoverSources.includes(book.cover.source))
    await deleteCover(book.cover.url).catch(() => {});
  res.status(204).end();
});
