import { Settings } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { useBooks } from '@/entities/book/queries';
import { useAuth } from '@/features/auth';
import { iconButtonClass } from '@/shared/ui/buttonStyles';
import { Eyebrow, PageTitle } from '@/shared/ui/PageHeading';
import { SiteHeader } from '@/shared/ui/SiteHeader';
import { Spinner } from '@/shared/ui/Spinner';
import { TransitionLink } from '@/shared/ui/TransitionLink';
import { AddBookButton } from './AddBookButton';
import { BookGrid } from './BookGrid';
import { ComingSoon } from './ComingSoon';
import { EmptyShelf } from './EmptyShelf';
import { LibraryNav } from './LibraryNav';
import type { SectionKey } from './sections';

// One page for every section, so the header and tabs stay put while the
// section underneath changes
export function LibraryPage({ section = 'all' }: { section?: SectionKey }) {
  const { user } = useAuth();
  const books = useBooks();

  const all = books.data?.pages.flatMap((page) => page.books) ?? [];
  const total = books.data?.pages[0]?.total ?? 0;
  // Once there are books, the shelves take the page: tabs over the grid,
  // and adding another lives up in the header. Until then, a greeting and
  // the empty shelf sit in the middle of the screen.
  const shelved = all.length > 0;
  // The other sections always show the tabs, so there's a way back
  const tabbed = shelved || section !== 'all';

  return (
    <main className='bg-paper flex min-h-screen flex-col text-ink'>
      <SiteHeader home='/library'>
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
          tabbed ? 'pb-16 pt-2 sm:pt-4' : 'justify-center pb-28',
        )}
      >
        {books.isPending ? (
          <div className='flex justify-center py-10 text-muted'>
            <Spinner />
          </div>
        ) : books.isError ? (
          <p className='py-10 text-center text-sm text-danger'>
            Your shelves didn’t load. {books.error.message}
          </p>
        ) : tabbed ? (
          <>
            <LibraryNav current={section} counts={{ all: total }} />
            <div className='mt-8 sm:mt-12 xl:mt-16'>
              {section === 'all' ? (
                <BookGrid
                  books={all}
                  hasMore={books.hasNextPage}
                  loadingMore={books.isFetchingNextPage}
                  loadMore={books.fetchNextPage}
                />
              ) : (
                <ComingSoon section={section} />
              )}
            </div>
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
