import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';
import { pageWidthClass } from '@/shared/ui/surfaces';
import { BackLink } from '@/shared/ui/BackLink';
import { LibraryHeader, LibraryNav } from '@/widgets/library-header';

// A page within the library, about one book: the library's own header and
// tabs (none of them open), a way back the way the reader came, and a
// centred column for the book
export function BookFrame({
  back,
  wide = false,
  backdrop,
  backBeside = false,
  children,
}: {
  // Where Back goes when there's nowhere to go back to
  back: string;
  wide?: boolean;
  // Behind the top of the page, under everything
  backdrop?: ReactNode;
  // Back is the page's own to place on a wide screen (beside the content
  // rather than above it); it's here only on narrower ones
  backBeside?: boolean;
  children: ReactNode;
}) {
  return (
    <main className='bg-paper relative isolate min-h-screen text-ink'>
      {backdrop}
      <LibraryHeader />
      {/* Placed as on the shelves, so the tabs stay just where they were,
          and stick as they scroll by, all the way down */}
      <div className={cn('pb-24 pt-2 sm:pt-4', pageWidthClass)}>
        <LibraryNav />
        <div
          className={cn(
            'mx-auto w-full pt-8 sm:pt-10',
            // Wide, a book's page spreads across the screen; a form keeps
            // to a column
            !wide && 'max-w-4xl',
          )}
        >
          <div className={backBeside ? 'lg:hidden' : undefined}>
            <BackLink to={back} returns />
          </div>
          {children}
        </div>
      </div>
    </main>
  );
}
