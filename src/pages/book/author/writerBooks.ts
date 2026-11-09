import type { copiesOf } from '@/entities/book/theirWorks';
import type { Book, SimilarBook } from '@/entities/book/types';
import { paths } from '@/shared/config/paths';

// A book of the writer's on the line of their life: the year it first
// came out, and the reader's copy, if they have one (`bookId`), read or
// not, and the stars they gave it
export type LifePin = {
  key: string;
  title: string;
  year: number;
  coverUrl?: string;
  bookId?: string;
  read: boolean;
  rating?: number;
  // Its page from the catalogue, when it isn't the reader's
  work?: SimilarBook;
};

// The page a book on the line opens: the reader's copy, or the catalogue's
export const pinPage = (pin: LifePin) => ({
  to: pin.bookId ? paths.book(pin.bookId) : paths.work(pin.key),
  state: pin.work && { work: pin.work },
});

// The writer's books along their life, oldest first: the catalogue's, each
// as the reader's copy of it where there's one (`copyOf`, copiesOf), then
// the reader's others, those the catalogue doesn't know; any without a
// year left off
export function lifePins(
  works: SimilarBook[],
  theirs: Book[],
  copyOf: ReturnType<typeof copiesOf>,
): LifePin[] {
  const placed = new Set<string>();
  const pins = works.flatMap((work): LifePin[] => {
    const { book, bookId } = copyOf(work);
    if (bookId) placed.add(bookId);
    const year = work.firstPublishYear ?? book?.firstPublishedYear;
    if (!year) return [];
    return [
      {
        key: work.workKey,
        title: book?.title ?? work.title,
        year,
        coverUrl: book?.cover?.url ?? work.coverUrl,
        bookId,
        read: book?.copy?.reading === 'read',
        rating: book?.copy?.rating ?? work.rating,
        work: bookId ? undefined : work,
      },
    ];
  });
  for (const book of theirs)
    if (!placed.has(book.id) && book.firstPublishedYear)
      pins.push({
        key: book.id,
        title: book.title,
        year: book.firstPublishedYear,
        coverUrl: book.cover?.url,
        bookId: book.id,
        read: book.copy?.reading === 'read',
        rating: book.copy?.rating,
      });
  return pins.sort((a, b) => a.year - b.year);
}

// Pins along a line, each kept at least `near` from the last in its row:
// raised over the one before it where it would come nearer, as low as
// it'll go, in no more than `most` rows (with no room in any, in the one
// it comes nearest least in). The row each sits in.
export function pinRows(xs: number[], near: number, most = Infinity) {
  const ends: number[] = [];
  return xs.map((x) => {
    const free = ends.findIndex((end) => end <= x);
    const row =
      free >= 0
        ? free
        : ends.length < most
          ? ends.length
          : ends.indexOf(Math.min(...ends));
    ends[row] = x + near;
    return row;
  });
}

// The years a writer's line runs over: from their birth to their death,
// or to now, stretched to take in any book from before or after (one
// published once they'd gone); with neither year known, just their books'.
// `tight` (a phone's, with no room to spare): their books' years alone,
// their birth and death named only if they fall among them.
export type RulerSpan = {
  from: number;
  to: number;
  born?: number;
  died?: number;
};

export function rulerSpan(
  pins: { year: number }[],
  born?: number,
  died?: number,
  tight = false,
): RulerSpan {
  const years = pins.map((pin) => pin.year);
  const first = Math.min(...years);
  const last = Math.max(...years);
  if (tight) {
    const [from, to] = [first - 2, Math.max(last + 2, first + 8)];
    const within = (year?: number) =>
      year !== undefined && year >= from && year <= to ? year : undefined;
    return { from, to, born: within(born), died: within(died) };
  }
  const from = Math.min(born ?? first - 2, first);
  const end = died ?? (born ? new Date().getFullYear() : last + 2);
  return { from, to: Math.max(end, last, from + 10), born, died };
}
