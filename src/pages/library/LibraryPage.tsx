import { useLayoutEffect, useState } from 'react';
import { useNavigationType } from 'react-router';
import { cn } from '@/shared/lib/cn';
import { scrollPageTo } from '@/shared/lib/pageScroll';
import { useMediaQuery } from '@/shared/lib/useMediaQuery';
import { useBottomEdge } from '@/shared/lib/useBottomEdge';
import { useBooks } from '@/entities/book/queries';
import { useAuth } from '@/features/auth';
import { Eyebrow, PageTitle } from '@/shared/ui/PageHeading';
import { BackToTop } from '@/shared/ui/BackToTop';
import {
  LibraryHeader,
  LibraryNav,
  type SectionKey,
} from '@/widgets/library-header';
import { ComingSoon } from './ComingSoon';
import { EmptyShelf } from './EmptyShelf';
import { LibraryBooks } from './LibraryBooks';
import { PlacesSection } from './places/PlacesSection';
import { useShelf } from './useShelf';
import { useBookView } from './views/views';
import { needsEveryBook } from './views/order';
import { useShelfOrder } from './views/useShelfOrder';
import { ShelfToolbar } from './ShelfToolbar';
import { ViewStage } from './ViewStage';
import { useShelfSearch } from './views/useShelfSearch';
import { FormError } from '@/shared/ui/FormError';
import { Loading } from '@/shared/ui/Loading';
import { pageWidthClass } from '@/shared/ui/surfaces';

// One page for every section, so the header and tabs stay put while the
// section underneath changes
export function LibraryPage({ section = 'all' }: { section?: SectionKey }) {
  const { user } = useAuth();
  const books = useBooks();
  const search = useShelfSearch();
  const phone = useMediaQuery('(max-width: 639px)');
  const { view, arrived, leaving, left, choose, chooseKind } = useBookView();

  const shelfOrder = useShelfOrder();
  // The sky shows every book, and any order but the newest first needs
  // them all, as do the places, to find the books not yet in one
  const shelf = useShelf(
    books,
    search.query,
    view === 'universe' ||
      needsEveryBook(shelfOrder.arrangement) ||
      section === 'places',
  );
  const { all } = shelf;
  const total = books.data?.pages[0]?.total ?? 0;
  // Once there are books, the shelves take the page: tabs over the grid,
  // and adding another lives up in the header. Until then, a greeting and
  // the empty shelf sit in the middle of the screen.
  const shelved = all.length > 0;
  // The other sections always show the tabs, so there's a way back
  const tabbed = shelved || section !== 'all';
  // The sky fills the whole screen, with everything else floating over it
  const sky = shelved && section === 'all' && view === 'universe';
  // The books are fitted into the sky below the search and view choices
  const [toolbar, skyInset, toolbarShown] = useBottomEdge();
  // The top of another section (the places, a home or a room in them), for
  // the way back up to show once it's scrolled away
  const [sectionTop, setSectionTop] = useState<HTMLElement | null>(null);
  // On a phone the keyboard hides most of the sky, so a search over it
  // lists what it finds rather than lighting the stars up
  const listFinds = sky && phone;
  // Another section, chosen, starts at its top, already there as the page
  // turns to it; gone back to, it's where it was left (app/PageScroll)
  const arrival = useNavigationType();
  useLayoutEffect(() => {
    if (arrival !== 'POP') scrollPageTo(0);
  }, [section, arrival]);

  return (
    <main
      className={cn(
        'bg-paper flex flex-col overflow-x-clip text-ink',
        // The sky is a screen tall, and the page doesn't scroll past it
        sky ? 'h-dvh overflow-hidden' : 'min-h-screen',
      )}
    >
      <LibraryHeader
        adding={tabbed}
        // Over the sky, and over it still as it goes; staying put from one
        // section to another (transitions-in-place.css)
        className={cn(
          'library-header',
          (sky || leaving === 'universe') && 'relative z-10',
        )}
      />

      <div
        className={cn(
          'flex flex-1 flex-col',
          pageWidthClass,
          // A little extra room below lifts the block to the optical centre
          tabbed ? 'pt-2 sm:pt-4' : 'justify-center pb-28',
          tabbed && !sky && 'pb-16',
          // Over the sky, only the controls themselves catch the pointer
          sky && 'pointer-events-none',
        )}
      >
        {books.isPending ? (
          <Loading />
        ) : books.isError ? (
          <FormError
            message={`Your shelves didn’t load. ${books.error.message}`}
            className='py-10 text-center'
          />
        ) : tabbed ? (
          <>
            <LibraryNav current={section} counts={{ all: total }} />
            {section === 'all' ? (
              <>
                <ShelfToolbar
                  edge={toolbar}
                  search={search}
                  shelf={shelf}
                  listFinds={listFinds}
                  view={view}
                  onView={choose}
                  onViewKind={chooseKind}
                  order={shelfOrder}
                />
                <ViewStage
                  view={view}
                  leaving={leaving}
                  switched={arrived === 'switched'}
                  onLeft={left}
                >
                  {(shown) => (
                    <LibraryBooks
                      shelf={shelf}
                      search={search.query}
                      arrangement={shelfOrder.arrangement}
                      view={shown}
                      viewEased={arrived !== 'load'}
                      skyInset={skyInset}
                      skyLightsFinds={!listFinds}
                    />
                  )}
                </ViewStage>
              </>
            ) : (
              <div className='mt-8 sm:mt-12 xl:mt-16'>
                <span ref={setSectionTop} aria-hidden className='block' />
                {section === 'places' ? (
                  <PlacesSection shelf={shelf} total={total} />
                ) : (
                  <ComingSoon section={section} />
                )}
              </div>
            )}
          </>
        ) : (
          <>
            <div className='flex flex-col items-center text-center'>
              <Eyebrow rise={0}>Your library</Eyebrow>
              <PageTitle rise={80} className='mt-3 sm:mt-4'>
                Hello, {user?.name}.
              </PageTitle>
            </div>
            <div className='mt-10 sm:mt-14'>
              <EmptyShelf />
            </div>
          </>
        )}
      </div>
      {/* The sky never scrolls; long shelves do. Up once the search and
          the view choices are gone. */}
      {tabbed && !sky && (
        <BackToTop after={section === 'all' ? toolbarShown : sectionTop} />
      )}
    </main>
  );
}
