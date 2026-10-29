import { useMemo } from 'react';
import type { Book } from '@/entities/book/types';
import { Loading } from '@/shared/ui/Loading';
import { Universe } from './universe/Universe';
import type { Shelf } from '@/entities/book/useShelf';
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
// lights up the finds. Unless the finds are listed under the search (on a
// phone, the keyboard hiding most of the page): then every book stays as
// it was.
export function LibraryBooks({
  shelf,
  search,
  view,
  skyInset,
  findsListed = false,
  viewEased = false,
  arrangement = usual,
}: {
  shelf: Shelf;
  search: string;
  view: BookView;
  // How far down the controls over the sky reach
  skyInset: number;
  // What a search finds is listed under it, not shown here
  findsListed?: boolean;
  // The view itself came in by a transition
  viewEased?: boolean;
  // How the grid and the list are ordered, and what fades back in them
  arrangement?: Arrangement;
}) {
  const universe = view === 'universe';
  const { all, complete } = shelf;
  // What's looked for here, and what that finds
  const sought = findsListed ? '' : search;
  const found = findsListed ? all : shelf.found;

  // The stars to light up: everything a search found
  const lit = useMemo(
    () => (sought ? new Set(found.map((book) => book.id)) : null),
    [sought, found],
  );
  // What the grid and the list show, easing over from one search to the next
  const { order, reversed, fade } = arrangement;
  const sorted = useMemo(
    () => ordered(found, order, reversed),
    [found, order, reversed],
  );
  const shown = useEasedResults(sorted, sought, { ease: !universe });
  const faded = (book: Book) => fadesBack(book, fade);

  if (universe)
    return (
      <Universe
        books={all}
        lit={lit}
        eased={viewEased}
        notice={sought && complete && !found.length && nothingMatches(sought)}
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
        paging={paging}
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
