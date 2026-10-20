import { useEffect, useMemo } from 'react';
import type { BooksPage } from '@/entities/book/api';
import type { useBooks } from '@/entities/book/queries';
import { Universe } from './universe/Universe';
import { BookGrid } from './views/BookGrid';
import { BookList } from './views/BookList';
import type { CardSize } from './views/BookCard';
import { useEasedResults } from './views/useEasedResults';
import type { BookView } from './views/views';

type Books = ReturnType<typeof useBooks>;

const gridSizes: Partial<Record<BookView, CardSize>> = {
  'grid-s': 'S',
  'grid-m': 'M',
  'grid-l': 'L',
};

const booksIn = (pages: BooksPage[] | undefined) =>
  pages?.flatMap((page) => page.books) ?? [];

// Every page of `books`, loaded one after another while `when` holds
function useLoadAll(books: Books, when: boolean) {
  const { hasNextPage, isFetchingNextPage, fetchNextPage } = books;
  useEffect(() => {
    if (when && hasNextPage && !isFetchingNextPage) void fetchNextPage();
  }, [when, hasNextPage, isFetchingNextPage, fetchNextPage]);
}

const nothingMatches = (search: string) =>
  `Nothing on your shelves matches “${search}”.`;

// The books, the way the reader chose to see them: `all` of them, and what
// a search `found`. The grid and the list show only what was found; the sky
// keeps every star in its place and lights up the finds.
export function LibraryBooks({
  all,
  found,
  search,
  view,
  skyInset,
  skyLightsFinds = true,
  skyFocus = null,
}: {
  all: Books;
  found: Books;
  search: string;
  view: BookView;
  // How far down the controls over the sky reach
  skyInset: number;
  // Whether the sky lights up what a search finds (on a phone the finds
  // are listed instead), and one book picked to fly over to
  skyLightsFinds?: boolean;
  skyFocus?: string | null;
}) {
  const universe = view === 'universe';
  // The sky shows every book at once, so it loads the rest straight away
  useLoadAll(all, universe);
  useLoadAll(found, universe && Boolean(search));

  // Built only when the pages change, so the sky isn't laid out afresh on
  // every render
  const allPages = all.data?.pages;
  const everyBook = useMemo(() => booksIn(allPages), [allPages]);
  const foundPages = found.data?.pages;
  const results = useMemo(() => booksIn(foundPages), [foundPages]);

  // The stars to light up: one picked book, or everything a search found
  const lit = useMemo(
    () =>
      skyFocus
        ? new Set([skyFocus])
        : search && skyLightsFinds
          ? new Set(results.map((book) => book.id))
          : null,
    [skyFocus, search, skyLightsFinds, results],
  );
  // What the grid and the list show, easing over from one search to the next
  const shown = useEasedResults(results, search, {
    ready: !found.isPlaceholderData,
    ease: !universe,
  });

  if (universe)
    return (
      <Universe
        books={everyBook}
        lit={lit}
        notice={
          search &&
          skyLightsFinds &&
          !found.isPlaceholderData &&
          !results.length &&
          nothingMatches(search)
        }
        insetTop={skyInset}
      />
    );
  if (shown.search && !shown.books.length)
    return (
      <p className='py-16 text-center text-sm text-muted'>
        {nothingMatches(shown.search)}
      </p>
    );

  const paging = {
    hasMore: found.hasNextPage,
    loadingMore: found.isFetchingNextPage,
    loadMore: found.fetchNextPage,
  };
  const size = gridSizes[view];
  const rise = !shown.eased;
  if (size)
    return <BookGrid books={shown.books} size={size} rise={rise} {...paging} />;
  return (
    <BookList
      books={shown.books}
      columns={view === 'list-columns'}
      rise={rise}
      {...paging}
    />
  );
}
