import type { Book } from '@/entities/book/types';
import { authors } from '@/entities/book/favouriteAuthors';
import { byDecade, extremes } from './libraryStats';
import { publishers } from './publishers';
import { byStars } from './readingStats';
import { readSpans } from './readingYears';
import { tally, type Tally } from '@/entities/book/tallies';

// What the chapters that count either the physical books or every one
// (ScopedChapter) find among `books`; none where there's too little to go on

// Lines, once there are any
const some = (rows: Tally[]) => (rows.length ? rows : null);
// Lines, only once one of them has more than one of the books
const manyBy = (rows: Tally[]) =>
  (rows[0]?.books.length ?? 0) > 1 ? rows : null;

export function scopedFindings(books: Book[]) {
  return {
    extremes: extremes(books),
    publishers: manyBy(publishers(books)),
    read: {
      books: books.filter((book) => book.copy?.reading === 'read'),
      spans: readSpans(books),
    },
    stars: byStars(books),
    decades: byDecade(books),
    genres: some(tally(books, (book) => book.genres ?? [])),
    authors: manyBy(authors(books)),
    // The language each was first written in (its own, for one that isn't
    // a translation)
    languages: some(
      tally(books, (book) => {
        const first = book.originalLanguage ?? book.language;
        return first ? [first] : [];
      }),
    ),
  };
}

export type Findings = ReturnType<typeof scopedFindings>;
