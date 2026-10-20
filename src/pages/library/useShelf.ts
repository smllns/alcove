import { useEffect, useMemo } from 'react';
import { bookMatches } from '@/entities/book/matches';
import type { useBooks } from '@/entities/book/queries';

type Books = ReturnType<typeof useBooks>;

// The reader's books, and those matching `query`, searched right here: the
// shelves are already loaded, so there's nothing to wait for. While there's
// a search (or the whole sky is shown), the rest of the pages load too, so
// nothing is missed. `complete`: every page is in.
export function useShelf(books: Books, query: string, needsAll: boolean) {
  const { hasNextPage, isFetchingNextPage, fetchNextPage } = books;
  const loadAll = needsAll || Boolean(query);
  useEffect(() => {
    if (loadAll && hasNextPage && !isFetchingNextPage) void fetchNextPage();
  }, [loadAll, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const pages = books.data?.pages;
  const all = useMemo(
    () => pages?.flatMap((page) => page.books) ?? [],
    [pages],
  );
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
