import { ObjectId } from 'mongodb';
import { books, users } from '../db.js';
import { seenBook, sightOf } from './profile.js';
import { sharedWork } from './sharedBooks.js';

// One of another reader's books the catalogue doesn't know (book-…), as
// any reader may see it: what's said of the book itself on their shelves
// (its description, publisher, pages, genres, …), nothing of their copy;
// for one the reader looking may see on their page. Otherwise null.

export async function readerBook(id: string, viewer: ObjectId) {
  if (!ObjectId.isValid(id)) return null;
  const book = await books().findOne({ _id: new ObjectId(id) });
  const owner = book && (await users().findOne({ _id: book.userId }));
  if (!book || !owner) return null;
  const { parts } = await sightOf(owner, viewer);
  return seenBook(book, parts) ? sharedWork(book) : null;
}
