import type { BookInput } from '@/entities/book/types';
import type { WantedEntry } from '@/entities/list/api';

// A book as another site's export has it, ready to be brought over: the
// book (a paper edition standing on the shelves, an e-book or audiobook
// read without a copy, as its format says), whether it's only one the
// reader wants to read (for their Want to read list, not the shelves),
// and when they added it there (for the books to come over in the order
// they were added)
export type Imported = {
  book: BookInput;
  wanted: boolean;
  added?: string;
};

// All but those only wanted
const kept = (books: Imported[]) => books.filter((each) => !each.wanted);

// The books for the library: all but those only wanted
export const toBring = (books: Imported[]) =>
  kept(books).map(({ book }) => book);

// Those only wanted, as Want to read takes them: to be found in the
// catalogue by their ISBN, or put in as they are
export const toWant = (books: Imported[]): WantedEntry[] =>
  books
    .filter((each) => each.wanted)
    .map(({ book }) => ({
      title: book.title,
      authors: book.authors,
      isbn: book.isbn,
    }));

// How many go on the shelves, how many come as e-books or audiobooks, and
// how many are only wanted
export function countBrought(books: Imported[]) {
  const library = kept(books);
  const screen = library.filter(({ book }) => book.copy?.nonPhysical).length;
  return {
    shelved: library.length - screen,
    screen,
    wanted: books.length - library.length,
  };
}

// A fresh import's own id, for its books to be undone by: twelve random
// bytes, written as the server keeps its ids
export const newImportId = () =>
  Array.from(crypto.getRandomValues(new Uint8Array(12)), (byte) =>
    byte.toString(16).padStart(2, '0'),
  ).join('');
