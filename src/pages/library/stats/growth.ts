import { ways } from '@/entities/book/acquired';
import type { Book } from '@/entities/book/types';
import { byOption } from '@/entities/book/tallies';

// The months of the stats: when books came to the reader, and when they
// were finished, going only by the days the reader gave for them (a book
// brought into alcove all at once with the rest has no such day, and
// doesn't count)

type When = { year: number; month: number };
export type DayOf = (book: Book) => When | null;

// A calendar day as the book's details keep it, YYYY-MM-DD
const when = (day?: string): When | null =>
  day && day.length >= 7
    ? { year: Number(day.slice(0, 4)), month: Number(day.slice(5, 7)) - 1 }
    : null;

// The day the reader says a book came to them
export const cameOn: DayOf = (book) => when(book.copy?.acquired?.date);

// The day they finished reading it, for one they've read
export const finishedOn: DayOf = (book) =>
  book.copy?.reading === 'read' ? when(book.copy.finished) : null;

// Every year one of the books has a day in, the latest first
export const yearsOf = (books: Book[], dayOf: DayOf) =>
  [...new Set(books.flatMap((book) => dayOf(book)?.year ?? []))].sort(
    (a, b) => b - a,
  );

// The books with a day in each month of `year`, January first
export function byMonth(books: Book[], year: number, dayOf: DayOf) {
  const months: Book[][] = Array.from({ length: 12 }, () => []);
  for (const book of books) {
    const day = dayOf(book);
    if (day?.year === year) months[day.month].push(book);
  }
  return months;
}

// The months of `year` that have been, or begun: all of them, for a year
// that's over
export function monthsSoFar(year: number, today = new Date()) {
  if (year < today.getFullYear()) return 12;
  return year === today.getFullYear() ? today.getMonth() + 1 : 0;
}

// The books by how they came to the reader (bought, a gift, …), the most
// first, those told in their own words counted as another way; and how
// many say how they came at all
export function byArrival(books: Book[]) {
  const found = byOption(books, ways, (book) => {
    const how = book.copy?.acquired?.how;
    if (!how) return undefined;
    return ways.some((way) => way.value === how) ? how : ways.at(-1)!.value;
  });
  found.rows.sort((a, b) => b.books.length - a.books.length);
  return found;
}
