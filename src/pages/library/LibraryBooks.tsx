import { useMemo } from 'react';
import type { Book } from '@/entities/book/types';
import { Loading } from '@/shared/ui/Loading';
import { Universe } from './universe/Universe';
import type { Shelf } from './useShelf';
import { BookGrid } from './views/BookGrid';
import { BookList } from './views/BookList';
import type { CardSize } from './views/BookCard';
import { useEasedResults } from './views/useEasedResults';
import { fadesBack, ordered, usual, type Arrangement } from './views/order';
import type { BookView } from './views/views';

const gridSizes: Partial<Record<BookView, CardSize>> = {
  'grid-s': 'S',
  'grid-m': 'M',
  'grid-l': 'L',
};

const nothingMatches = (search: string) =>
  `Nothing on your shelves matches “${search}”.`;

// The books, the way the reader chose to see them. The grid and the list
// show only what a search found; the sky keeps every star in its place and
// lights up the finds.
export function LibraryBooks({
  shelf,
  search,
  view,
  skyInset,
  skyLightsFinds = true,
  viewEased = false,
  arrangement = usual,
}: {
  shelf: Shelf;
  search: string;
  view: BookView;
  // How far down the controls over the sky reach
  skyInset: number;
  // Whether the sky lights up what a search finds (on a phone the finds
  // are listed instead)
  skyLightsFinds?: boolean;
  // The view itself came in by a transition
  viewEased?: boolean;
  // How the grid and the list are ordered, and what fades back in them
  arrangement?: Arrangement;
}) {
  const universe = view === 'universe';
  const { all, found, complete } = shelf;

  // The stars to light up: everything a search found
  const lit = useMemo(
    () =>
      search && skyLightsFinds ? new Set(found.map((book) => book.id)) : null,
    [search, skyLightsFinds, found],
  );
  // What the grid and the list show, easing over from one search to the next
  const { order, reversed, fade } = arrangement;
  const sorted = useMemo(
    () => ordered(found, order, reversed),
    [found, order, reversed],
  );
  const shown = useEasedResults(sorted, search, { ease: !universe });
  const faded = (book: Book) => fadesBack(book, fade);

  if (universe)
    return (
      <Universe
        books={all}
        lit={lit}
        eased={viewEased}
        notice={
          search &&
          skyLightsFinds &&
          complete &&
          !found.length &&
          nothingMatches(search)
        }
        insetTop={skyInset}
      />
    );
  // Nothing found is only certain once every book is in
  if (shown.search && !shown.books.length)
    return complete ? (
      <p className='py-16 text-center text-sm text-muted'>
        {nothingMatches(shown.search)}
      </p>
    ) : (
      <Loading className='py-16' />
    );

  const { paging } = shelf;
  const size = gridSizes[view];
  const rise = !shown.eased && !viewEased;
  if (size)
    return (
      <BookGrid
        books={shown.books}
        size={size}
        rise={rise}
        faded={faded}
        {...paging}
      />
    );
  return (
    <BookList
      books={shown.books}
      columns={view === 'list-columns'}
      rise={rise}
      faded={faded}
      {...paging}
    />
  );
}
