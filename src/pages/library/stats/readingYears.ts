import type { Book } from '@/entities/book/types';
import { DAY_MS, fromDay, today } from '@/shared/lib/dates';

// The books read from start to finish: each from the day the reader began
// it to the day they finished it, for those with both days given; and
// those being read now (`reading`), from the day they began to today

export type Span = {
  book: Book;
  from: Date;
  to: Date;
  days: number;
  reading?: boolean;
};

export function readSpans(books: Book[]): Span[] {
  return books.flatMap((book) => {
    const copy = book.copy;
    const reading = copy?.reading === 'reading';
    if (!copy?.started || !(reading || copy.reading === 'read')) return [];
    const ends = reading ? today() : copy.finished;
    const from = fromDay(copy.started);
    const to = ends && fromDay(ends);
    if (!from || !to || to < from) return [];
    const days = Math.round((+to - +from) / DAY_MS) + 1;
    return [{ book, from, to, days, ...(reading && { reading }) }];
  });
}

// Every year some book was being read in, the latest first
export function spanYears(spans: Span[]) {
  const years = new Set<number>();
  for (const { from, to } of spans)
    for (let y = from.getFullYear(); y <= to.getFullYear(); y++) years.add(y);
  return [...years].sort((a, b) => b - a);
}

// How many days books took, on average; none, none
const average = (spans: Span[]) =>
  spans.length
    ? Math.round(spans.reduce((sum, { days }) => sum + days, 0) / spans.length)
    : 0;

// Whether a book was being read at some time from `start` up to `end`
const during = ({ from, to }: Span, start: Date, end: Date) =>
  from < end && to >= start;

// What was read in `year`: each book's place along it (where it began and
// ended, as shares of the year, cut to it) and the row it lies in, books
// read at the same time lying one over another, as low as there's room;
// how many rows that took (the most read at once), how long a book took
// on average (one being read now taking no part, not done yet), and the
// books being read in each month of it
export function readingYear(spans: Span[], year: number) {
  const start = new Date(year, 0, 1);
  const end = new Date(year + 1, 0, 1);
  const length = (+end - +start) / DAY_MS;
  const shareOf = (date: Date) =>
    Math.min(1, Math.max(0, (+date - +start) / DAY_MS / length));
  const rows: Date[] = [];
  const laid = spans
    .filter((span) => during(span, start, end))
    .sort((a, b) => +a.from - +b.from)
    .map((span) => {
      let row = rows.findIndex((last) => last < span.from);
      if (row < 0) row = rows.push(span.to) - 1;
      else rows[row] = span.to;
      return {
        ...span,
        row,
        left: shareOf(span.from),
        // Through to the end of the day it was finished on
        right: shareOf(new Date(+span.to + DAY_MS)),
      };
    });
  return {
    laid,
    months: Array.from({ length: 12 }, (_, m) =>
      laid.filter((span) =>
        during(span, new Date(year, m, 1), new Date(year, m + 1, 1)),
      ),
    ),
    rows: rows.length,
    average: average(laid.filter((span) => !span.reading)),
  };
}
