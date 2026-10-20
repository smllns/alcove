import { useEffect, useState } from 'react';
import type { Book } from '@/entities/book/types';
import { easeChange, isEasing } from '@/shared/lib/easeChange';

// The books to show for `search`. When the search changes, the new results
// ease in, the cards that stay gliding to their new places; while one such
// change is still easing (fast typing), the next just shows, rather than
// cutting it short. A grown or trimmed list for the same search (a book
// removed, more loaded) just shows too, as does everything with `ease` off
// (nothing on screen to rearrange, as in the sky). `eased` says the books
// on screen came in by a transition, so they needn't also rise in.
export function useEasedResults(
  books: Book[],
  search: string,
  { ease }: { ease: boolean },
) {
  const [shown, setShown] = useState({ books, search, eased: false });

  const plain = shown.search === search || !ease || isEasing();
  if (shown.books !== books && plain)
    setShown({ books, search, eased: shown.eased && shown.search === search });

  useEffect(() => {
    if (!ease || shown.search === search) return;
    easeChange(() => setShown({ books, search, eased: true }));
  }, [ease, search, books, shown.search]);

  return shown;
}
