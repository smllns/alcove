import type { BookDoc } from '../db.js';

// A book on a reader's shelves as the catalogue would tell it, nothing of
// their copy: its work there, or, for one the catalogue doesn't know, a key
// of its own (book-…, which the client tells apart: isReadersOwn), opening
// what's known of it here; its title, writers, cover and year.

export const workKeyOf = (book: Pick<BookDoc, '_id' | 'openLibrary'>) =>
  book.openLibrary?.work ?? `book-${book._id.toHexString()}`;

// What of a book is read to tell it so
export const shelvedProjection = {
  title: 1,
  authors: 1,
  firstPublishedYear: 1,
  cover: 1,
  openLibrary: 1,
  pages: 1,
} as const;

export const asShelved = (
  book: Pick<
    BookDoc,
    '_id' | 'title' | 'authors' | 'firstPublishedYear' | 'cover' | 'openLibrary'
  >,
) => ({
  workKey: workKeyOf(book),
  title: book.title,
  authors: book.authors,
  coverUrl: book.cover?.url,
  firstPublishYear: book.firstPublishedYear,
  editionCount: 0,
});
