import { useBooksByWriter } from '@/entities/book/queries';
import type { Book, SimilarBook } from '@/entities/book/types';
import { settled } from '@/shared/lib/settled';

// The reader's other books by this book's writer, newest first, and
// whether that's known yet
export function useTheirOthers(book: Book) {
  const query = useBooksByWriter(book.authors[0]);
  const others = (query.data ?? []).filter((other) => other.id !== book.id);
  return { others, known: settled(query) };
}

// One of the reader's own books, to sit in a row of books (BookRow), where
// it opens its own page
export const asRowBook = (book: Book): SimilarBook => ({
  workKey: book.openLibrary?.work ?? book.id,
  title: book.title,
  authors: book.authors,
  coverUrl: book.cover?.url,
  editionCount: 1,
  bookId: book.id,
});
