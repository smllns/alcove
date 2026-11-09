import { useState } from 'react';
import { useLocation } from 'react-router';
import type { Book } from '@/entities/book/types';
import type { Paging } from './MoreBooks';

// How many books the shelves show at first, and how many more each time
// the last of them comes into view
const STEP = 48;

// How many each page in the history had shown, by its entry, so going back
// to it shows as many again and lands where it was left
const shownBy = new Map<string, number>();

// The books the grid and the list show: the first few dozen of those
// loaded, more as the reader scrolls down to them, and once all those
// loaded are shown, more asked for (`paging`). Not every book loaded at
// once: after the sky had loaded the whole shelf, an iPhone, coming back
// from a book, took seconds to draw them all, covers and all, and gave up
// on the page turn.
export function useShelfWindow(books: Book[], paging: Paging) {
  const { key } = useLocation();
  const [shown, setShown] = useState(() => ({
    key,
    count: shownBy.get(key) ?? STEP,
  }));
  if (shown.key !== key) setShown({ key, count: shownBy.get(key) ?? STEP });
  const { count } = shown;
  const more = () => {
    const next = count + STEP;
    shownBy.set(key, next);
    setShown({ key, count: next });
    if (next > books.length && paging.hasMore && !paging.loadingMore)
      paging.loadMore();
  };
  return {
    books: books.slice(0, count),
    paging: {
      hasMore: count < books.length || paging.hasMore,
      loadingMore: paging.loadingMore,
      loadMore: more,
    },
  };
}
