import { ObjectId, type Filter } from 'mongodb';
import { books, storedCoverSources, type BookDoc } from '../db.js';
import { unaccented } from '../lib/text.js';
import type { BookInput } from './schemas.js';

// What the client sees of a book
export const toPublicBook = ({ _id, userId: _userId, ...book }: BookDoc) => ({
  ...book,
  id: _id.toHexString(),
  createdAt: book.createdAt.toISOString(),
  updatedAt: book.updatedAt.toISOString(),
});

// How fresh a moment the reader's screen says the copy was put somewhere
// must be, to be taken
const FRESH = 60_000;

// When the copy was put where it is: just now when it's somewhere it
// wasn't (`before`), as the reader's screen has it if that's fresh, or
// otherwise when it was put there before
function placedAt(copy: BookInput['copy'], before?: BookDoc['copy']) {
  if (!copy?.place) return undefined;
  const now = new Date().toISOString();
  if (JSON.stringify(copy.place) === JSON.stringify(before?.place))
    return before?.placedAt ?? now;
  const told = copy.placedAt;
  return told && Math.abs(Date.parse(told) - Date.now()) < FRESH ? told : now;
}

export async function addBook(userId: ObjectId, input: BookInput) {
  const now = new Date();
  const book: BookDoc = {
    _id: new ObjectId(),
    userId,
    ...input,
    copy: input.copy && { ...input.copy, placedAt: placedAt(input.copy) },
    createdAt: now,
    updatedAt: now,
  };
  await books().insertOne(book);
  return book;
}

// One page of a reader's books, newest first. Pass the last id of the
// previous page as `after` to get the next.
export async function listBooks(
  userId: ObjectId,
  { limit, after }: { limit: number; after?: ObjectId },
) {
  const page = await books()
    .find({
      userId,
      ...(after && { _id: { $lt: after } }),
    })
    .sort({ _id: -1 })
    .limit(limit + 1)
    .toArray();
  const hasMore = page.length > limit;
  const items = hasMore ? page.slice(0, limit) : page;
  return {
    items,
    nextCursor: hasMore ? items.at(-1)!._id.toHexString() : null,
  };
}

// A book on the shelves that looks like the same one: same catalogue work,
// same ISBN, or the same title by the same first author (ignoring case)
export function findSameBook(userId: ObjectId, input: BookInput) {
  const matches: Filter<BookDoc>[] = [
    {
      title: input.title,
      ...(input.authors[0] && { 'authors.0': input.authors[0] }),
    },
  ];
  if (input.openLibrary?.work)
    matches.push({ 'openLibrary.work': input.openLibrary.work });
  if (input.isbn) matches.push({ isbn: input.isbn });
  return books().findOne(
    { userId, $or: matches },
    { sort: { _id: -1 }, collation: { locale: 'en', strength: 2 } },
  );
}

// Which of the catalogue's `works` are on the reader's shelves: the id of
// the book for each work key that is
export async function shelvedWorks(userId: ObjectId, works: string[]) {
  const found = await books()
    .find(
      { userId, 'openLibrary.work': { $in: works } },
      { projection: { _id: 1, 'openLibrary.work': 1 } },
    )
    .toArray();
  return new Map(
    found.map((book) => [book.openLibrary?.work, book._id.toHexString()]),
  );
}

// A writer's name without case, accents, spaces or punctuation, so "J. R. R.
// Tolkien" and "J.R.R. Tolkien" are the one writer. Must match how the
// client tells writers apart (src/entities/book/authors.ts).
const writerKey = (name: string) =>
  unaccented(name).replace(/[^\p{L}\p{N}]/gu, '');

// The reader's books by the same writer (their first author), newest
// first: only names are read to find them, then the books themselves
export async function booksByWriter(userId: ObjectId, name: string) {
  const wanted = writerKey(name);
  if (!wanted) return [];
  const all = await books()
    .find({ userId }, { projection: { authors: 1 } })
    .toArray();
  const ids = all
    .filter((b) => writerKey(b.authors[0] ?? '') === wanted)
    .map((b) => b._id);
  if (!ids.length) return [];
  return books()
    .find({ _id: { $in: ids }, userId })
    .sort({ _id: -1 })
    .toArray();
}

export const findBook = (userId: ObjectId, id: ObjectId) =>
  books().findOne({ _id: id, userId });

// The book as the reader now describes it, everything replaced but when
// it was added. The cover it had stays as it was (a copy we keep, say)
// when it's still the same picture. Null when it isn't theirs.
export async function updateBook(
  userId: ObjectId,
  id: ObjectId,
  input: BookInput,
) {
  const old = await findBook(userId, id);
  if (!old) return null;
  const book: BookDoc = {
    _id: id,
    userId,
    ...input,
    copy: input.copy && {
      ...input.copy,
      placedAt: placedAt(input.copy, old.copy),
    },
    cover: input.cover?.url === old.cover?.url ? old.cover : input.cover,
    createdAt: old.createdAt,
    updatedAt: new Date(),
  };
  await books().replaceOne({ _id: id, userId }, book);
  return { book, old };
}

export const deleteBook = (userId: ObjectId, id: ObjectId) =>
  books().findOneAndDelete({ _id: id, userId });

// The covers in our storage (uploaded photos, copied catalogue covers)
// that a book still shows
export const storedCoversInUse = async (userId: ObjectId) =>
  new Set(
    await books().distinct('cover.url', {
      userId,
      'cover.source': { $in: storedCoverSources },
    }),
  );

// Everything on a reader's shelves, when their account goes
export const deleteAllBooks = (userId: ObjectId) =>
  books().deleteMany({ userId });

export const countBooks = (userId: ObjectId) =>
  books().countDocuments({ userId });
