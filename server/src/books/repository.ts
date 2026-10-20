import { ObjectId, type Filter } from 'mongodb';
import { books, type BookDoc } from '../db.js';
import type { BookInput } from './schemas.js';
import { searchFilter } from './search.js';

// What the client sees of a book
export const toPublicBook = ({ _id, userId: _userId, ...book }: BookDoc) => ({
  ...book,
  id: _id.toHexString(),
  createdAt: book.createdAt.toISOString(),
  updatedAt: book.updatedAt.toISOString(),
});

export async function addBook(userId: ObjectId, input: BookInput) {
  const now = new Date();
  const book: BookDoc = {
    _id: new ObjectId(),
    userId,
    ...input,
    createdAt: now,
    updatedAt: now,
  };
  await books().insertOne(book);
  return book;
}

// A reader's books, or those matching `search`
const shelf = (userId: ObjectId, search?: string): Filter<BookDoc> => ({
  userId,
  ...searchFilter(search),
});

// One page of a reader's books (or of those matching `search`), newest
// first. Pass the last id of the previous page as `after` to get the next.
export async function listBooks(
  userId: ObjectId,
  {
    limit,
    after,
    search,
  }: { limit: number; after?: ObjectId; search?: string },
) {
  const page = await books()
    .find({
      ...shelf(userId, search),
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

export const findBook = (userId: ObjectId, id: ObjectId) =>
  books().findOne({ _id: id, userId });

export const deleteBook = (userId: ObjectId, id: ObjectId) =>
  books().findOneAndDelete({ _id: id, userId });

// The photos a reader uploaded that a book still shows
export const uploadedCoversInUse = async (userId: ObjectId) =>
  new Set(
    await books().distinct('cover.url', {
      userId,
      'cover.source': 'upload',
    }),
  );

// Everything on a reader's shelves, when their account goes
export const deleteAllBooks = (userId: ObjectId) =>
  books().deleteMany({ userId });

export const countBooks = (userId: ObjectId, search?: string) =>
  books().countDocuments(shelf(userId, search));
