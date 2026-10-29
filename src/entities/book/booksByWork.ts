import type { Book } from './types';

// The reader's own books by the catalogue's works they're of
export const booksByWork = (books: Book[]) =>
  new Map(
    books.flatMap((book) =>
      book.openLibrary?.work ? [[book.openLibrary.work, book] as const] : [],
    ),
  );
