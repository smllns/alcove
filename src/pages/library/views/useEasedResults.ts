import { useEffect, useState } from 'react';
import type { Book } from '@/entities/book/types';
import { easeChange } from '@/shared/lib/easeChange';

// The books to show for `search`. When the search changes, the new results
// ease in once they've arrived (`ready`), the cards that stay gliding to
// their new places; more pages of the same search, or a book removed, just
// show. With `ease` off (nothing on screen to rearrange, as in the sky),
// every change just shows. `eased` says the books on screen came in that
// way, so they needn't also rise in on their own.
export function useEasedResults(
  books: Book[],
  search: string,
  { ready, ease }: { ready: boolean; ease: boolean },
) {
  const [shown, setShown] = useState({ books, search, eased: false });

  // The same search grown or trimmed, or no easing: follow it as it is
  if (ready && shown.books !== books && (shown.search === search || !ease))
    setShown({ books, search, eased: shown.eased && shown.search === search });

  useEffect(() => {
    if (!ease || !ready || shown.search === search) return;
    easeChange(() => setShown({ books, search, eased: true }));
  }, [ease, ready, search, books, shown.search]);

  return shown;
}
