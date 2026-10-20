import type { Ref } from 'react';
import type { Shelf } from './useShelf';
import { BookSearch } from './views/BookSearch';
import { SearchResults } from './views/SearchResults';
import { ShelfOrderMenu } from './views/ShelfOrderMenu';
import type { useShelfOrder } from './views/useShelfOrder';
import type { useShelfSearch } from './views/useShelfSearch';
import type { BookView, ViewKind } from './views/views';
import { ViewSwitcher } from './views/ViewSwitcher';

// Over the books: the search, how the shelf is ordered (not in the sky,
// where there's no order to speak of) and the view choices. On a phone the
// search takes a row of its own.
export function ShelfToolbar({
  edge,
  search,
  shelf,
  listFinds,
  picked,
  onPick,
  view,
  onView,
  onViewKind,
  order,
}: {
  // For measuring where it ends, to fit the sky in below
  edge: Ref<HTMLDivElement>;
  search: ReturnType<typeof useShelfSearch>;
  shelf: Shelf;
  // List what a search finds under the field, to pick one to fly to,
  // rather than lighting the stars up (on a phone, behind the keyboard)
  listFinds: boolean;
  picked: string | null;
  onPick: (id: string | null) => void;
  view: BookView;
  onView: (view: BookView) => void;
  onViewKind: (kind: ViewKind) => void;
  order: ReturnType<typeof useShelfOrder>;
}) {
  return (
    <div
      ref={edge}
      className='relative z-10 mt-6 flex flex-wrap items-center justify-end gap-2 sm:mt-8 *:pointer-events-auto'
    >
      <div className='relative w-full sm:w-auto'>
        <BookSearch
          value={search.text}
          onChange={(text) => {
            onPick(null);
            search.setText(text);
          }}
          found={search.query ? shelf.found.length : undefined}
          className='w-full sm:w-60'
        />
        {listFinds && search.query && !picked && (
          <SearchResults
            books={shelf.found}
            search={search.query}
            loading={!shelf.complete}
            onPick={(book) => {
              onPick(book.id);
              // Down goes the keyboard, so the sky can be seen
              if (document.activeElement instanceof HTMLElement)
                document.activeElement.blur();
            }}
          />
        )}
      </div>
      {view !== 'universe' && (
        <ShelfOrderMenu
          arrangement={order.arrangement}
          onOrder={order.setOrder}
          onFade={order.setFade}
        />
      )}
      <ViewSwitcher view={view} onChange={onView} onChangeKind={onViewKind} />
    </div>
  );
}
