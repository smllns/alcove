import { useEffect, type RefObject } from 'react';
import { pageScrollY, scrollPageTo } from '@/shared/lib/pageScroll';

// How long a book found stays picked out
const SHOWN = 2800;

// A book looked for (from its page: ?book), found on its shelf in `room`
// (data-book, CoverShelf) once the room is `ready` (opened): brought into
// the middle of the screen and picked out for a moment (data-found)
export function useFoundBook(
  room: RefObject<HTMLElement | null>,
  found: string | undefined,
  ready: boolean,
) {
  useEffect(() => {
    if (!ready || !found) return;
    const book = room.current?.querySelector<HTMLElement>(
      `[data-book="${CSS.escape(found)}"]`,
    );
    if (!book) return;
    const box = book.getBoundingClientRect();
    scrollPageTo(
      pageScrollY(book) + box.top - (innerHeight - box.height) / 2,
      'smooth',
      book,
    );
    book.dataset.found = '';
    const done = setTimeout(() => delete book.dataset.found, SHOWN);
    return () => clearTimeout(done);
  }, [room, found, ready]);
}
