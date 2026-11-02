import type { Book } from '@/entities/book/types';
import type { HomeBooks } from '../places/arrange';

// What the stats tab says of the reader's books, worked out from the
// books themselves: nothing is asked of the server or the catalogue

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

// How many a list (genres, authors, languages) may hold to be shown whole;
// past that, its first few are shown and the rest open out on asking
export const FEW = 8;

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
    pages: books.reduce((sum, book) => sum + (book.pages ?? 0), 0),
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

// When a book came out: first, in any edition, or else this copy's edition
export const yearOf = (book: Book) =>
  book.firstPublishedYear ?? book.publishedYear;

// The most decades drawn; any older are gathered into one
const DECADES = 14;

// The books by the decade they came out in, from the first decade any did
// to the last, every decade between drawn even with nothing in it; the
// oldest of a long span gathered as one (`older`)
export function byDecade(books: Book[]) {
  const dated = books.filter((book) => yearOf(book) !== undefined);
  if (!dated.length) return null;
  const decadeOf = (book: Book) => Math.floor(yearOf(book)! / 10) * 10;
  const decades = dated.map(decadeOf);
  const last = Math.max(...decades);
  const first = Math.max(Math.min(...decades), last - (DECADES - 1) * 10);
  const older = Math.min(...decades) < first;
  // Each book into its decade's column in one pass, the oldest of a long
  // span into the first
  const columns: { from: number; older: boolean; books: Book[] }[] = [];
  if (older) columns.push({ from: first - 10, older: true, books: [] });
  for (let from = first; from <= last; from += 10)
    columns.push({ from, older: false, books: [] });
  dated.forEach((book, i) => {
    const at = (decades[i] - first) / 10 + (older ? 1 : 0);
    columns[Math.max(at, 0)].books.push(book);
  });
  const byYear = [...dated].sort((a, b) => yearOf(a)! - yearOf(b)!);
  return { columns, oldest: byYear[0], newest: byYear.at(-1)! };
}

// The thickest book and the slimmest, by their pages, and what an average
// one runs to; only among the books whose pages are known
export function extremes(books: Book[]) {
  const paged = books
    .filter((book) => book.pages)
    .sort((a, b) => b.pages! - a.pages!);
  if (paged.length < 2) return null;
  const pages = paged.reduce((sum, book) => sum + book.pages!, 0);
  return {
    longest: paged[0],
    shortest: paged.at(-1)!,
    average: Math.round(pages / paged.length),
    counted: paged.length,
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
