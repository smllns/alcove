import type { ReactNode } from 'react';
import type { ReaderPage } from '@/entities/reader/types';
import { callName } from '@/entities/user/types';
import { cn } from '@/shared/lib/cn';
import { paths } from '@/shared/config/paths';
import { BackLink } from '@/shared/ui/BackLink';
import { sheetClass } from '@/shared/ui/surfaces';
import { AskingPart } from './AskingPart';
import { FavouriteWriters } from './FavouriteWriters';
import { InCommon } from './InCommon';
import { ReaderLists } from './ReaderLists';
import { ReaderQuotes } from './ReaderQuotes';
import { ReaderSide } from './ReaderSide';
import { ReaderYear } from './ReaderYear';
import { ReadingNow } from './ReadingNow';
import { RecentBooks } from './RecentBooks';
import { useOwned } from './useOwned';

// A reader's page, laid out as a writer's is: who they are beside it,
// staying in view on a wide screen as it scrolls by, and on a sheet of its
// own each part of it they let the one looking see. Their books open the
// one looking's own copy where they have one (on their own page, the book
// itself). A page opened only to those let in says so instead.
export function ReaderView({
  page,
  back = false,
}: {
  page: ReaderPage;
  // The way back over the photo on a wide screen, staying with it
  back?: boolean;
}) {
  const owned = useOwned(page);
  const empty = !page.books.length && !page.lists.length;
  return (
    <div className='grid gap-10 lg:grid-cols-[minmax(0,15rem)_1fr] lg:gap-14 xl:grid-cols-[minmax(0,17rem)_1fr] xl:gap-20'>
      <div className='lg:sticky lg:top-28 lg:self-start xl:top-7'>
        {back && (
          <div className='hidden lg:block'>
            <BackLink to={paths.library} returns />
          </div>
        )}
        <ReaderSide page={page} />
      </div>
      <div
        className={cn(
          'relative -mx-2 flex min-w-0 flex-col gap-14 p-5 sm:mx-0 sm:p-10',
          sheetClass,
        )}
      >
        {!page.open ? (
          <Note>
            {callName(page)} lets only the readers they say yes to see their
            page. Ask to follow, and it opens once they do.
          </Note>
        ) : empty ? (
          <Note>
            {page.you
              ? 'Your page fills in as you add books and make lists public.'
              : 'Nothing here for you to see yet.'}
          </Note>
        ) : null}
        <AskingPart page={page} />
        <ReadingNow page={page} owned={owned} />
        <InCommon page={page} owned={owned} />
        <RecentBooks page={page} owned={owned} />
        <FavouriteWriters page={page} owned={owned} />
        <ReaderLists page={page} />
        <ReaderYear page={page} owned={owned} />
        <ReaderQuotes page={page} />
      </div>
    </div>
  );
}

// A word in place of the page's parts
function Note({ children }: { children: ReactNode }) {
  return (
    <p className='animate-rise py-6 text-center font-serif text-lg text-muted'>
      {children}
    </p>
  );
}
