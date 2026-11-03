import type { Book } from '@/entities/book/types';

// The most books a pile is drawn with; past that, one stands for several
export const TALLEST = 40;

// The books of each group as their piles draw them: all of them, or, where
// the fullest has more than `most`, every so many of each alike, so the
// fullest comes to about `most` and the rest keep their heights to it
export function thinned(groups: Book[][], most = TALLEST) {
  const fullest = Math.max(0, ...groups.map((books) => books.length));
  const every = Math.max(1, Math.ceil(fullest / most));
  return groups.map((books) => books.filter((_, k) => k % every === 0));
}
