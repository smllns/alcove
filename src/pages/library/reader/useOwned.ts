import { useMemo } from 'react';
import { ownCopies } from '@/entities/book/ownCopies';
import { useBooks } from '@/entities/book/queries';
import { useShelf } from '@/entities/book/useShelf';
import type { ReaderPage } from '@/entities/reader/types';
import { ownedOf } from './readerBooks';

// The reader looking's own copies of a reader's books, by their work keys
// (ownCopies); on their own page, the books themselves (ownedOf). Worked
// out again only as either changes.
export function useOwned(page: ReaderPage) {
  const mine = useShelf(useBooks(), '', true).all;
  return useMemo(
    () => (page.you ? ownedOf(page.books) : ownCopies(page.books, mine)),
    [page.you, page.books, mine],
  );
}
