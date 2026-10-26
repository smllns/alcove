import { seedOf } from '@/shared/lib/seed';
import type { Book } from './types';

// How a book stands on a shelf, in pixels at a shelf's own size: as tall
// as its format (a pocket book shortest, a hardcover tallest, each a
// little apart from the next, as real books are) and as thick as its
// pages. Always the same for the same book.

const tall = { pocket: 74, paperback: 88, hardcover: 100 };
const unknownTall = 90;

export function spineSize(book: Book) {
  const seed = seedOf(book.id);
  const height =
    (book.format ? tall[book.format] : unknownTall) + Math.round(seed * 10 - 5);
  const width = book.pages
    ? Math.min(30, Math.max(9, Math.round(book.pages / 20)))
    : 13 + Math.round(seed * 7);
  return { width, height };
}
