import { useEffect, useMemo } from 'react';
import { bookMatches } from './matches';
import type { Book } from './types';
import type { useBooks } from './queries';

type Books = ReturnType<typeof useBooks>;

// The reader's books, and those matching `query`, searched right here: the
// shelves are already loaded, so there's nothing to wait for. While there's
// a search (or the whole sky is shown), the rest of the pages load too, so
// nothing is missed. `complete`: every page is in. `keep`: the books shown
// at all (only the physical ones, say), to leave the rest out of both.
export function useShelf(
  books: Books,
  query: string,
  needsAll: boolean,
  keep?: (book: Book) => boolean,
) {
  const { hasNextPage, isFetchingNextPage, fetchNextPage } = books;
  const loadAll = needsAll || Boolean(query);
  useEffect(() => {
    if (loadAll && hasNextPage && !isFetchingNextPage) void fetchNextPage();
  }, [loadAll, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const pages = books.data?.pages;
  const all = useMemo(() => {
    const loaded = pages?.flatMap((page) => page.books) ?? [];
    return keep ? loaded.filter(keep) : loaded;
  }, [pages, keep]);
  const found = useMemo(
    () => (query ? all.filter((book) => bookMatches(book, query)) : all),
    [all, query],
  );

  return {
    all,
    found,
    complete: !hasNextPage,
    paging: {
      hasMore: hasNextPage,
      loadingMore: isFetchingNextPage,
      loadMore: fetchNextPage,
    },
  };
}

export type Shelf = ReturnType<typeof useShelf>;
