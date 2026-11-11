import { useMemo } from 'react';
import { bookMatches } from '@/entities/book/matches';
import type { Book } from '@/entities/book/types';
import { useDebouncedValue } from '@/shared/lib/useDebouncedValue';
import { Loading } from '@/shared/ui/Loading';
import { Universe } from './universe/Universe';
import type { Shelf } from '@/entities/book/useShelf';
import { BookGrid } from '@/widgets/book-grid';
import { BookList } from './views/BookList';
import type { CardSize } from '@/widgets/book-grid';
import { useEasedResults } from './views/useEasedResults';
import { useShelfWindow } from './views/useShelfWindow';
import {
  fadesBack,
  ordered,
  usual,
  type Arrangement,
} from '@/widgets/book-order';
import type { BookView } from './views/views';

const gridSizes: Partial<Record<BookView, CardSize>> = {
  'grid-s': 'S',
  'grid-m': 'M',
  'grid-l': 'L',
};

// How long the typing has to pause for the sky to look for what's typed
const SKY_SETTLE_MS = 350;

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

  // The stars to light up: everything a search found, once the typing has
  // paused, not to send the sky gliding after every key
  const skySought = useDebouncedValue(sought, SKY_SETTLE_MS);
  const lit = useMemo(
    () =>
      skySought
        ? new Set(
            all
              .filter((book) => bookMatches(book, skySought))
              .map((book) => book.id),
          )
        : null,
    [skySought, all],
  );
  // What the grid and the list show, easing over from one search to the next
  const { order, reversed, fade } = arrangement;
  const sorted = useMemo(
    () => ordered(found, order, reversed),
    [found, order, reversed],
  );
  const shown = useEasedResults(sorted, sought, { ease: !universe });
  const windowed = useShelfWindow(shown.books, shelf.paging);
  const faded = (book: Book) => fadesBack(book, fade);

  if (universe)
    return (
      <Universe
        books={all}
        lit={lit}
        eased={viewEased}
        notice={
          skySought && complete && !lit?.size && nothingMatches(skySought)
        }
        insetTop={skyInset}
        show={arrangement.show}
        ready={complete}
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

  const { paging } = windowed;
  const size = gridSizes[view];
  const rise = !shown.eased && !viewEased;
  if (size)
    return (
      <BookGrid
        books={windowed.books}
        size={size}
        rise={rise}
        faded={faded}
        paging={paging}
      />
    );
  return (
    <BookList
      books={windowed.books}
      columns={view === 'list-columns'}
      rise={rise}
      faded={faded}
      {...paging}
    />
  );
}
