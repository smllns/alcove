import { Settings } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/shared/lib/cn';
import { useMediaQuery } from '@/shared/lib/useMediaQuery';
import { useBottomEdge } from '@/shared/lib/useBottomEdge';
import { useBooks } from '@/entities/book/queries';
import { useCoverCopies } from '@/entities/book/useCoverCopies';
import { useAuth } from '@/features/auth';
import { iconButtonClass } from '@/shared/ui/buttonStyles';
import { Eyebrow, PageTitle } from '@/shared/ui/PageHeading';
import { SiteHeader } from '@/shared/ui/SiteHeader';
import { TransitionLink } from '@/shared/ui/TransitionLink';
import { BackToTop } from '@/shared/ui/BackToTop';
import { AddBookButton } from './AddBookButton';
import { ComingSoon } from './ComingSoon';
import { EmptyShelf } from './EmptyShelf';
import { LibraryBooks } from './LibraryBooks';
import { LibraryNav } from './LibraryNav';
import type { SectionKey } from './sections';
import { useShelf } from './useShelf';
import { useBookView } from './views/views';
import { needsEveryBook } from './views/order';
import { useShelfOrder } from './views/useShelfOrder';
import { ShelfToolbar } from './ShelfToolbar';
import { ViewStage } from './ViewStage';
import { useShelfSearch } from './views/useShelfSearch';
import { FormError } from '@/shared/ui/FormError';
import { Loading } from '@/shared/ui/Loading';

// One page for every section, so the header and tabs stay put while the
// section underneath changes
export function LibraryPage({ section = 'all' }: { section?: SectionKey }) {
  const { user } = useAuth();
  const books = useBooks();
  const search = useShelfSearch();
  // A book picked from the search list, for the sky to fly to
  const [picked, setPicked] = useState<string | null>(null);
  const phone = useMediaQuery('(max-width: 639px)');
  const { view, arrived, leaving, left, choose, chooseKind } = useBookView();

  const shelfOrder = useShelfOrder();
  // The sky shows every book, and any order but the newest first needs
  // them all
  const shelf = useShelf(
    books,
    search.query,
    view === 'universe' || needsEveryBook(shelfOrder.arrangement),
  );
  const { all } = shelf;
  const total = books.data?.pages[0]?.total ?? 0;
  // Catalogue covers load slowly; keep copies of our own
  useCoverCopies(all);
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
  // On a phone the keyboard hides most of the sky, so a search over it
  // lists what it finds rather than lighting the stars up
  const listFinds = sky && phone;

  return (
    <main
      // Holds the whole page still while the sky is shown (universe.css)
      data-sky-page={sky || undefined}
      className={cn(
        'bg-paper flex flex-col overflow-x-clip text-ink',
        // The sky is a screen tall, and the page doesn't scroll past it
        sky ? 'h-dvh overflow-hidden' : 'min-h-screen',
      )}
    >
      <SiteHeader
        home='/library'
        // Over the sky, and over it still as it goes
        className={sky || leaving === 'universe' ? 'relative z-10' : undefined}
      >
        <TransitionLink
          to='/settings'
          aria-label='Settings'
          className={iconButtonClass()}
        >
          <Settings
            size={16}
            className='transition-transform duration-700 ease-soft group-hover:rotate-45'
          />
        </TransitionLink>
        {tabbed && <AddBookButton />}
      </SiteHeader>

      <div
        className={cn(
          'mx-auto flex w-full max-w-7xl flex-1 flex-col px-6 sm:px-10 lg:px-16',
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
                  picked={picked}
                  onPick={setPicked}
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
                      skyFocus={picked}
                    />
                  )}
                </ViewStage>
              </>
            ) : (
              <div className='mt-8 sm:mt-12 xl:mt-16'>
                <ComingSoon section={section} />
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
      {tabbed && !sky && <BackToTop after={toolbarShown} />}
    </main>
  );
}
