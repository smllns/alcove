import type { Book, SimilarBook } from '@/entities/book/types';
import { useWriterBooks } from '@/entities/book/useWriterBooks';

// The reader's other books by this book's writer (useWriterBooks), and
// whether that's known yet
export function useTheirOthers(book: Book) {
  const { books, known } = useWriterBooks(book.authors[0]);
  return { others: books.filter((other) => other.id !== book.id), known };
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
  rating: book.copy?.rating,
});
