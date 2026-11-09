import type { Book } from '@/entities/book/types';

// The most shown at once
const MOST = 9;

// A line kept from a writer: quoted or written by the reader, from one of
// their books, or (no `book`) the writer's own words from Wikiquote
export type KeptNote = { text: string; quote: boolean; book?: Book };

// What the reader kept from a writer's books, the lines they quoted and
// the notes they wrote; then, to fill it out, words of the writer's own
// (`quotes`, only with the page they're from, to credit)
export function keptNotes(
  theirs: Book[],
  quotes: string[],
  source?: string | null,
): KeptNote[] {
  const own = theirs.flatMap((book) => [
    ...(book.copy?.quotes ?? []).map((text) => ({ text, quote: true, book })),
    ...(book.copy?.notes ?? []).map((text) => ({ text, quote: false, book })),
  ]);
  const theirWords = (source ? quotes : []).map((text) => ({
    text,
    quote: true,
  }));
  return [...own, ...theirWords].slice(0, MOST);
}
