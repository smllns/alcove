import type { Book } from '@/entities/book/types';

const yearOf = (date: string) => Number(date.slice(0, 4));

// The reader and a writer, in a few numbers, from the books of theirs the
// reader has: since when (the first year they began or finished one, or,
// with no dates kept, the first year one came to them, `dated` false),
// how many they've read of how many, how many pages those come to, and
// the one they gave the most stars, if they've given any
export function readerFigures(theirs: Book[]) {
  const read = theirs.filter((book) => book.copy?.reading === 'read');
  const dates = theirs.flatMap((book) =>
    [book.copy?.started, book.copy?.finished].filter((date): date is string =>
      Boolean(date),
    ),
  );
  const rated = theirs.filter((book) => book.copy?.rating);
  return {
    since: Math.min(
      ...(dates.length ? dates : theirs.map((book) => book.createdAt)).map(
        yearOf,
      ),
    ),
    dated: dates.length > 0,
    read: read.length,
    of: theirs.length,
    pages: read.reduce((sum, book) => sum + (book.pages ?? 0), 0),
    favourite: rated.sort(
      (a, b) => (b.copy?.rating ?? 0) - (a.copy?.rating ?? 0),
    )[0],
  };
}
