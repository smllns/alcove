import type { Book } from './types';

// The reader's own books by the catalogue's works they're of: its own, and
// any they said are the same book (a translation kept apart)
export const booksByWork = (books: Book[]) =>
  new Map(
    books.flatMap((book) =>
      [book.openLibrary?.work, ...(book.openLibrary?.also ?? [])].flatMap(
        (work) => (work ? [[work, book] as const] : []),
      ),
    ),
  );
