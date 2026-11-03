import type { Book } from '@/entities/book/types';
import { counted } from '@/shared/lib/plural';
import type { HomeBooks } from '../places/arrange';
import { tally } from './tallies';

// What the stats tab says of the reader's books, worked out from the
// books themselves: nothing is asked of the server or the catalogue

// How thick a book is, in metres: its pages, and its covers (boards
// thicker than paper). A book with no page count is taken as an average one.
const PAGE = 0.000075;
export const AVERAGE_PAGES = 300;
export const thickness = (book: Book) =>
  (book.pages || AVERAGE_PAGES) * PAGE +
  (book.format === 'hardcover' ? 0.006 : 0.002);

// The books, their pages, the people who wrote them, how many haven't
// been read yet, and how high they'd stand stacked up
export function figures(books: Book[]) {
  const read = books.filter((book) => book.copy?.reading === 'read').length;
  return {
    books: books.length,
    pages: pagesIn(books),
    authors: new Set(books.flatMap((book) => book.authors)).size,
    unread: books.length - read,
    height: books.reduce((sum, book) => sum + thickness(book), 0),
  };
}

// The figures a drawing's title block gives, named
export const stampOf = (found: ReturnType<typeof figures>) =>
  [
    ['Books', found.books],
    ['Pages', found.pages],
    ['Authors', found.authors],
    ['Unread', found.unread],
  ] as [string, number][];

// What's said of a book where its length matters: how many pages it has
export const pagesOf = (book: Book) => counted(book.pages ?? 0, 'page');

// How many pages the books come to, those with none given counting none
export const pagesIn = (books: Book[]) =>
  books.reduce((sum, book) => sum + (book.pages ?? 0), 0);

// When a book came out: first, in any edition, or else this copy's edition
export const yearOf = (book: Book) =>
  book.firstPublishedYear ?? book.publishedYear;

// The most columns drawn (decades and folds); any older are gathered into
// one
const DECADES = 14;

// The books by the decade they came out in, from the first decade any did
// to the last, every decade between drawn even with nothing in it (a long
// run of them folded into one break); the oldest of a long span gathered
// as one (`older`)
export function byDecade(books: Book[]) {
  const dated = books.filter((book) => yearOf(book) !== undefined);
  if (!dated.length) return null;
  const decades = dated.map((book) => Math.floor(yearOf(book)! / 10) * 10);
  const last = Math.max(...decades);
  // The decades drawn from `first` on, the books of any before it gathered
  // into one, then long empty runs folded
  const drawnFrom = (first: number) => {
    const older = Math.min(...decades) < first;
    const columns: Decade[] = [];
    if (older) columns.push({ from: first - 10, older: true, books: [] });
    for (let from = first; from <= last; from += 10)
      columns.push({ from, older: false, books: [] });
    dated.forEach((book, i) => {
      const at = (decades[i] - first) / 10 + (older ? 1 : 0);
      columns[Math.max(at, 0)].books.push(book);
    });
    return foldEmpty(columns);
  };
  // From the oldest book's decade, unless that leaves too many to draw
  let first = Math.min(...decades);
  let columns = drawnFrom(first);
  while (columns.length > DECADES) columns = drawnFrom((first += 10));
  const byYear = [...dated].sort((a, b) => yearOf(a)! - yearOf(b)!);
  return { columns, oldest: byYear[0], newest: byYear.at(-1)! };
}

// How many empty decades in a row are folded into one break
const FOLDED = 3;

type Decade = { from: number; older: boolean; books: Book[]; to?: number };

// Decades with nothing in them, as many as FOLDED or more in a row, folded
// into one break (`to`, the last of them), so a lone old book doesn't
// leave the piles narrow over a long run of nothing
function foldEmpty(columns: Decade[]) {
  const folded: Decade[] = [];
  let run: Decade[] = [];
  const close = () => {
    if (run.length >= FOLDED) folded.push({ ...run[0], to: run.at(-1)!.from });
    else folded.push(...run);
    run = [];
  };
  for (const column of columns) {
    if (column.books.length) {
      close();
      folded.push(column);
    } else run.push(column);
  }
  close();
  return folded;
}

// How many pages a pile of books of a length spans, and the last pile,
// which takes every book from its first page on
const BAND = 100;
const LAST = 8;
const bandOf = (pages: number) => Math.min(LAST, Math.floor(pages / BAND));

// The thickest book and the slimmest, by their pages, what an average one
// runs to, and the books in piles by their length, a hundred pages each,
// from the slimmest's pile to the doorstop's (the slimmer first in each);
// only among the books whose pages are known
export function extremes(books: Book[]) {
  const paged = books
    .filter((book) => book.pages)
    .sort((a, b) => a.pages! - b.pages!);
  if (paged.length < 2) return null;
  const pages = pagesIn(paged);
  const shortest = paged[0];
  const longest = paged.at(-1)!;
  const first = bandOf(shortest.pages!);
  const piles = Array.from(
    { length: bandOf(longest.pages!) - first + 1 },
    (_, i) => ({
      from: (first + i) * BAND,
      more: first + i === LAST,
      books: [] as Book[],
    }),
  );
  for (const book of paged) piles[bandOf(book.pages!) - first].books.push(book);
  return {
    longest,
    shortest,
    average: Math.round(pages / paged.length),
    piles,
  };
}

// The authors, the most kept first; between two with as many, the one
// whose books were rated higher
export function authors(books: Book[]) {
  const rated = (held: Book[]) => {
    const stars = held.flatMap((book) => book.copy?.rating ?? []);
    return stars.length ? stars.reduce((a, b) => a + b) / stars.length : 0;
  };
  return tally(books, (book) => book.authors).sort(
    (a, b) =>
      b.books.length - a.books.length || rated(b.books) - rated(a.books),
  );
}

// Every book kept in a home, wherever in it
export const booksIn = (home: HomeBooks) => [
  ...home.loose,
  ...home.rooms.flatMap(({ units, loose }) => [
    ...loose,
    ...units.flatMap(({ shelves, loose: lying }) => [
      ...lying,
      ...shelves.flatMap((shelf) => shelf.books),
    ]),
  ]),
];

// How tall the books stand stacked up, `scale` units to a metre, and how
// tall they're drawn: past `most` units, broken off (BookStack) and drawn
// only that tall
export function stacked(books: Book[], scale: number, most: number) {
  const tall = books.reduce((sum, book) => sum + thickness(book), 0) * scale;
  const broken = tall > most;
  return { tall, drawn: broken ? most : tall, broken };
}
