import { useState, type ReactNode } from 'react';
import { paths } from '@/shared/config/paths';
import { cn } from '@/shared/lib/cn';
import { usePageTurned } from '@/shared/lib/usePageTurned';
import { BackLink } from '@/shared/ui/BackLink';
import { BackToTop } from '@/shared/ui/BackToTop';
import { Eyebrow, PageTitle } from '@/shared/ui/PageHeading';
import { pageWidthClass, sheetClass } from '@/shared/ui/surfaces';
import { LibraryHeader, LibraryNav } from '@/widgets/library-header';
import { lightOf } from '../places/drawing/decor';

// Around any one list opened, the reader's or one every reader sees: the
// library's header and tabs, the way back, the pile by its measure on the
// left (`ruler`) with the ways to change it (`actions`) under it, as a
// book's are under its cover, and a way to look for a book in it
// (`search`) under them, all staying in sight as the books go by; on the
// right what it's called, a line about it and its books (`children`). On
// a phone, the pile comes under the line, the ways to change it under the
// pile, and the search under them. While it's `loading`, all of it is
// drawn bare (the lamp unlit, the title and line as soft bars, its books
// as `children` give them meanwhile), coming in as it's there; should it
// not come, `waiting` in its place.
export function ListFrame({
  eyebrow,
  title,
  line,
  ruler,
  actions,
  waiting,
  loading = false,
  search,
  lightKey,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  line: ReactNode;
  ruler: ReactNode;
  actions?: ReactNode;
  waiting?: ReactNode;
  loading?: boolean;
  // A way to look for a book in it
  search?: ReactNode;
  // The list's lamplight, its own colour (ListLamp)
  lightKey: string;
  children: ReactNode;
}) {
  // Its lamp comes on once the page has opened, a little of its light
  // falling over the whole page from above, as in a room (room.css); and
  // not before what's in it is there
  const lit = usePageTurned() && !loading;
  // The line under the title: once it's scrolled away, a way back up
  const [top, setTop] = useState<HTMLParagraphElement | null>(null);
  return (
    <main
      data-light={lightOf(lightKey)}
      data-lit={lit || undefined}
      // Its own layer, for the light from above to lie under all that's on
      // the page, the way back included, over only the paper
      className='list-page bg-paper isolate min-h-screen text-ink'
    >
      <span aria-hidden className='room-wash' />
      <LibraryHeader />
      <div className={cn('pb-24 pt-2 sm:pt-4', pageWidthClass)}>
        <LibraryNav />
        {/* Laid out as a book's page is: the pile where the cover is, the
            rest on a sheet beside it */}
        <div className='pt-8 sm:pt-10'>
          <div className={cn(!waiting && 'lg:hidden')}>
            <BackLink to={paths.lists} returns />
          </div>
          {waiting ?? (
            <div className='grid gap-10 lg:grid-cols-[minmax(0,14rem)_1fr] lg:gap-14 xl:grid-cols-[minmax(0,16rem)_1fr] xl:gap-20'>
              <div className='flex flex-col gap-6 max-lg:hidden lg:sticky lg:top-28 lg:self-start xl:top-7'>
                <BackLink to={paths.lists} returns className='self-start' />
                {/* Under all beside it, so the lamp's light round it lies
                    behind the way back and the sheet, never over them */}
                <div className='relative -z-10 animate-rise'>{ruler}</div>
                {/* Under the pile, as a book's are under its cover */}
                {actions && (
                  <div
                    className='animate-rise'
                    style={{ animationDelay: '120ms' }}
                  >
                    {actions}
                  </div>
                )}
                {search && !loading && (
                  <div
                    className='animate-rise'
                    style={{ animationDelay: '160ms' }}
                  >
                    {search}
                  </div>
                )}
              </div>
              <div
                className={cn(
                  'relative -mx-2 flex min-w-0 flex-col p-5 sm:mx-0 sm:p-10',
                  sheetClass,
                )}
              >
                <Eyebrow rise={0}>{eyebrow}</Eyebrow>
                <PageTitle rise={60} className='mt-3 text-balance'>
                  {loading ? (
                    <span className='block h-[0.85em] w-2/3 rounded-xl bg-ink/6' />
                  ) : (
                    title
                  )}
                </PageTitle>
                <p
                  ref={setTop}
                  className='mt-4 animate-rise text-[15px] text-muted'
                  style={{ animationDelay: '120ms' }}
                >
                  {loading ? (
                    <span className='inline-block h-[1em] w-48 rounded-md bg-ink/6 align-middle' />
                  ) : (
                    line
                  )}
                </p>
                <div className='relative -z-10 mt-8 lg:hidden'>{ruler}</div>
                {actions && <div className='mt-6 lg:hidden'>{actions}</div>}
                {search && !loading && (
                  <div className='mt-4 lg:hidden'>{search}</div>
                )}
                <div
                  className='mt-10 animate-rise border-t border-line/70 pt-10'
                  style={{ animationDelay: '200ms' }}
                >
                  {children}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <BackToTop after={top} />
    </main>
  );
}
