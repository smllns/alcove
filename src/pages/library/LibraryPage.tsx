import { Settings } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/shared/lib/cn';
import { useMediaQuery } from '@/shared/lib/useMediaQuery';
import { useBottomEdge } from '@/shared/lib/useBottomEdge';
import { useBooks } from '@/entities/book/queries';
import { useAuth } from '@/features/auth';
import { iconButtonClass } from '@/shared/ui/buttonStyles';
import { Eyebrow, PageTitle } from '@/shared/ui/PageHeading';
import { SiteHeader } from '@/shared/ui/SiteHeader';
import { TransitionLink } from '@/shared/ui/TransitionLink';
import { AddBookButton } from './AddBookButton';
import { ComingSoon } from './ComingSoon';
import { EmptyShelf } from './EmptyShelf';
import { LibraryBooks } from './LibraryBooks';
import { LibraryNav } from './LibraryNav';
import type { SectionKey } from './sections';
import { useBookView } from './views/views';
import { BookSearch } from './views/BookSearch';
import { SearchResults } from './views/SearchResults';
import { useShelfSearch } from './views/useShelfSearch';
import { ViewSwitcher } from './views/ViewSwitcher';
import { FormError } from '@/shared/ui/FormError';
import { Loading } from '@/shared/ui/Loading';

// One page for every section, so the header and tabs stay put while the
// section underneath changes
export function LibraryPage({ section = 'all' }: { section?: SectionKey }) {
  const { user } = useAuth();
  const books = useBooks();
  const search = useShelfSearch();
  const found = useBooks(search.settled);
  // A book picked from the search list, for the sky to fly to
  const [picked, setPicked] = useState<string | null>(null);
  const phone = useMediaQuery('(max-width: 639px)');
  const { view, choose, chooseKind } = useBookView();

  const all = books.data?.pages.flatMap((page) => page.books) ?? [];
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
  const [toolbar, skyInset] = useBottomEdge();
  // On a phone the keyboard hides most of the sky, so a search over it
  // lists what it finds rather than lighting the stars up
  const listFinds = sky && phone;

  return (
    <main
      className={cn(
        'bg-paper flex flex-col overflow-x-clip text-ink',
        // The sky is a screen tall, and the page doesn't scroll past it
        sky ? 'h-dvh overflow-hidden' : 'min-h-screen',
      )}
    >
      <SiteHeader home='/library' className={sky ? 'relative z-10' : undefined}>
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
                {/* On a phone the search takes a row of its own */}
                <div
                  ref={toolbar}
                  className='relative z-10 mt-6 flex flex-wrap items-center justify-end gap-2 sm:mt-8 *:pointer-events-auto'
                >
                  <div className='relative w-full sm:w-auto'>
                    <BookSearch
                      value={search.text}
                      onChange={(text) => {
                        setPicked(null);
                        search.setText(text);
                      }}
                      found={
                        search.settled ? found.data?.pages[0]?.total : undefined
                      }
                      className='w-full sm:w-60'
                    />
                    {listFinds && search.settled && !picked && (
                      <SearchResults
                        books={found.data?.pages.flatMap((p) => p.books) ?? []}
                        search={search.settled}
                        loading={found.isPlaceholderData || found.isPending}
                        onPick={(book) => {
                          setPicked(book.id);
                          // Down goes the keyboard, so the sky can be seen
                          if (document.activeElement instanceof HTMLElement)
                            document.activeElement.blur();
                        }}
                      />
                    )}
                  </div>
                  <ViewSwitcher
                    view={view}
                    onChange={choose}
                    onChangeKind={chooseKind}
                  />
                </div>
                <div
                  className={
                    // Behind the header and the controls, edge to edge
                    sky
                      ? 'pointer-events-auto fixed inset-0 z-0 flex'
                      : 'mt-6 sm:mt-8'
                  }
                >
                  <LibraryBooks
                    all={books}
                    found={found}
                    search={search.settled}
                    view={view}
                    skyInset={skyInset}
                    skyLightsFinds={!listFinds}
                    skyFocus={picked}
                  />
                </div>
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
    </main>
  );
}
