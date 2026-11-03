import type { Book } from '@/entities/book/types';

// The books counted in lines (an author, a genre, a way they came), the
// shape every ledger of the stats is drawn from

// Things counted among the books (an author, a genre, a language), with
// the books that have each, the commonest first
export type Tally = { name: string; books: Book[] };

export function tally(books: Book[], keysOf: (book: Book) => string[]) {
  const by = new Map<string, Book[]>();
  for (const book of books)
    for (const key of new Set(keysOf(book))) {
      const held = by.get(key);
      if (held) held.push(book);
      else by.set(key, [book]);
    }
  return [...by]
    .map(([name, held]): Tally => ({ name, books: held }))
    .sort(
      (a, b) => b.books.length - a.books.length || a.name.localeCompare(b.name),
    );
}

// How many books there are in all the lines (each counted once a line)
export const countIn = (rows: Tally[]) =>
  rows.reduce((sum, row) => sum + row.books.length, 0);

// The books by one of a set of `options` (the ways a book came, the shapes
// it can be in), in the options' order, those with none of them left out;
// and how many have one. Each line keeps its option's `value`.
export function byOption(
  books: Book[],
  options: { value: string; label: string }[],
  valueOf: (book: Book) => string | undefined,
) {
  const rows = options
    .map(({ value, label }) => ({
      value,
      name: label,
      books: books.filter((book) => valueOf(book) === value),
    }))
    .filter((row) => row.books.length);
  return { rows, told: countIn(rows) };
}

// How many a list (genres, authors, languages) may hold to be shown whole;
// past that, its first few are shown and the rest open out on asking
export const FEW = 8;
