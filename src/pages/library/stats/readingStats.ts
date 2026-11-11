import { isPhysical, nonPhysicalWays } from '@/entities/book/nonPhysical';
import type { Book } from '@/entities/book/types';
import { thickness } from './libraryStats';
import type { Tally } from '@/entities/book/tallies';

// What the stats say of how the reader gets on with their books: what's
// read and what's waiting, the stars they give, the ways they read

// Lines with no books in them left out
const some = (rows: Tally[]) => rows.filter((row) => row.books.length);

// The books by whether they've been read: read, being read, or not yet
// (as one never said to be read or being read is taken to be); with how
// high the physical ones still to read would stand stacked up, and the
// one waiting longest, of those with the day it came
export function byReading(books: Book[]) {
  const stateOf = (book: Book) => book.copy?.reading ?? 'unread';
  const unread = books.filter((book) => stateOf(book) === 'unread');
  const waiting = unread
    .filter((book) => book.copy?.acquired?.date)
    .sort((a, b) =>
      a.copy!.acquired!.date!.localeCompare(b.copy!.acquired!.date!),
    )[0];
  return {
    rows: some([
      { name: 'Read', books: books.filter((b) => stateOf(b) === 'read') },
      {
        name: 'Reading now',
        books: books.filter((b) => stateOf(b) === 'reading'),
      },
      { name: 'Not yet read', books: unread },
    ]),
    unread: unread.length,
    height: unread
      .filter(isPhysical)
      .reduce((sum, book) => sum + thickness(book), 0),
    waiting,
  };
}

// Stars written out, those given filled and the rest hollow
const starsOf = (n: number) => '★'.repeat(n) + '☆'.repeat(5 - n);

// The rated books by their stars, five first (a half star counted with
// the whole stars under it), with the stars given on average
export function byStars(books: Book[]) {
  const rated = books.filter((book) => book.copy?.rating);
  if (!rated.length) return null;
  const whole = (book: Book) => Math.max(1, Math.floor(book.copy!.rating!));
  const stars = rated.reduce((sum, book) => sum + book.copy!.rating!, 0);
  return {
    rows: some(
      [5, 4, 3, 2, 1].map((n) => ({
        name: starsOf(n),
        books: rated.filter((book) => whole(book) === n),
      })),
    ),
    average: Math.round((stars / rated.length) * 10) / 10,
    five: rated.filter((book) => book.copy!.rating === 5).length,
  };
}

// The books by the way they were read: on the reader's shelves, or not
// kept there (an e-book, an audiobook, borrowed, …), the most first
export function byWay(books: Book[]) {
  return some([
    { name: 'On your shelves', books: books.filter(isPhysical) },
    ...nonPhysicalWays.map(({ value, label }) => ({
      name: label,
      books: books.filter((book) => book.copy?.nonPhysical === value),
    })),
  ]).sort((a, b) => b.books.length - a.books.length);
}
