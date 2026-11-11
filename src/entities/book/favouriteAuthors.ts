import type { Book } from './types';
import { nameLetters, nearlySame, writerKey } from './writers';
import { gather, nameOf } from './sameNames';
import type { Tally } from './tallies';

// The reader's authors, each once however their name is written
// (entities/book/writers), the most kept first; between two with as many,
// the one whose books were rated higher
export function authors(books: Book[]) {
  const rated = (held: Book[]) => {
    const stars = held.flatMap((book) => book.copy?.rating ?? []);
    return stars.length ? stars.reduce((a, b) => a + b) / stars.length : 0;
  };
  return gather(books, (book) => book.authors, writerKey, nearlySame)
    .map((each): Tally => ({
      name: nameOf(each, nameLetters),
      books: each.books,
    }))
    .sort(
      (a, b) =>
        b.books.length - a.books.length || rated(b.books) - rated(a.books),
    );
}
