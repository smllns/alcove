import { counted } from '@/shared/lib/plural';
import type { Book } from './types';

// What's said of a book where its length matters: how many pages it has
export const pagesOf = (book: Book) => counted(book.pages ?? 0, 'page');

// How many pages the books come to, those with none given counting none
export const pagesIn = (books: Book[]) =>
  books.reduce((sum, book) => sum + (book.pages ?? 0), 0);
