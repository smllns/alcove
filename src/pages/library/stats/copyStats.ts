import { copyConditions } from '@/entities/book/conditions';
import type { Book } from '@/entities/book/types';
import { byOption, type Tally } from './tallies';

// What the stats say of the copies themselves: the shape they're in, and
// who published them

// The books by the shape they're in, the best first, those with none given
// left out; and how many have one
export const byCondition = (books: Book[]) =>
  byOption(books, copyConditions, (book) => book.copy?.condition);

// The publishers, the most books first, one written differently only in
// its capitals or spaces counted as the same (named as first found)
export function publishers(books: Book[]) {
  const by = new Map<string, Tally>();
  for (const book of books) {
    const name = book.publisher?.trim().replace(/\s+/g, ' ');
    if (!name) continue;
    const key = name.toLowerCase();
    const held = by.get(key);
    if (held) held.books.push(book);
    else by.set(key, { name, books: [book] });
  }
  return [...by.values()].sort(
    (a, b) => b.books.length - a.books.length || a.name.localeCompare(b.name),
  );
}
