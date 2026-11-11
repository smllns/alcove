import { booksByWork } from './booksByWork';
import { sameBookKey } from './matches';
import type { Book } from './types';

// The reader's own copies of other books (another reader's, a work's page
// opened), by those books' work keys: of the same work, or else (one the
// catalogue doesn't know, added from another reader's, say) the same title
// by the same writer
export function ownCopies(
  books: { workKey: string; title: string; authors: string[] }[],
  mine: Book[],
) {
  const byWork = booksByWork(mine);
  const byName = new Map(
    mine.map((book) => [sameBookKey(book.title, book.authors), book]),
  );
  return new Map(
    books.flatMap((book) => {
      const copy =
        byWork.get(book.workKey) ??
        byName.get(sameBookKey(book.title, book.authors));
      return copy ? [[book.workKey, copy] as const] : [];
    }),
  );
}
