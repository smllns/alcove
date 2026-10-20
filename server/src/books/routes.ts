import { Router, type Request } from 'express';
import { ObjectId } from 'mongodb';
import { currentUser } from '../auth/middleware.js';
import { HttpError } from '../lib/errors.js';
import { parseBody } from '../lib/validation.js';
import { getPlaces, resolvePlace } from '../places/repository.js';
import { deleteCover } from '../uploads/storage.js';
import {
  addBook,
  countBooks,
  deleteBook,
  findBook,
  findSameBook,
  listBooks,
  toPublicBook,
} from './repository.js';
import { addBookSchema } from './schemas.js';

// A reader's own books. Mounted behind requireUser.
export const booksRouter = Router();

const me = (req: Request) => currentUser(req)._id;

const notOnShelves = () =>
  new HttpError(404, 'not_found', 'That book isn’t on your shelves.');

const objectId = (value: unknown) => {
  if (typeof value !== 'string' || !ObjectId.isValid(value))
    throw notOnShelves();
  return new ObjectId(value);
};

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
  const search =
    typeof req.query.q === 'string' ? req.query.q.slice(0, 100) : undefined;
  const [page, total] = await Promise.all([
    listBooks(me(req), { limit, after, search }),
    countBooks(me(req), search),
  ]);
  res.json({
    books: page.items.map(toPublicBook),
    nextCursor: page.nextCursor,
    total,
  });
});

booksRouter.post('/', async (req, res) => {
  const { anotherCopy, ...input } = parseBody(addBookSchema, req.body);
  // Only places the reader actually has; anything stale is trimmed away
  if (input.copy?.place) {
    input.copy.place = resolvePlace(await getPlaces(me(req)), input.copy.place);
  }
  if (!anotherCopy) {
    const same = await findSameBook(me(req), input);
    if (same) throw alreadyShelved(same);
  }
  const book = await addBook(me(req), input);
  res.status(201).json({ book: toPublicBook(book) });
});

booksRouter.get('/:id', async (req, res) => {
  const book = await findBook(me(req), objectId(req.params.id));
  if (!book) throw notOnShelves();
  res.json({ book: toPublicBook(book) });
});

booksRouter.delete('/:id', async (req, res) => {
  const book = await deleteBook(me(req), objectId(req.params.id));
  if (!book) throw notOnShelves();
  if (book.cover?.source === 'upload')
    await deleteCover(book.cover.url).catch(() => {});
  res.status(204).end();
});
