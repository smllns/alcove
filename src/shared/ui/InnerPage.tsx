import type { ReactNode } from 'react';
import { LibraryBig } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { BackLink } from './BackLink';
import { ButtonLink } from './ButtonLink';
import { SiteHeader } from './SiteHeader';
import { pageWidthClass } from './surfaces';
import { paths } from '@/shared/config/paths';

const widths = {
  md: 'max-w-3xl',
  lg: 'max-w-4xl',
  // Settings and the like: as wide as the library's own pages
  wide: pageWidthClass,
};

// A page one step in from the library (settings, adding a book): the header
// with a way to the shelves, a way back to wherever the reader came from
// (the shelves, if from nowhere), and a centred column for the content.
// `fit`: the column as tall as the screen, no taller unless what's in it
// grows (its last part, stretching, takes up what's left), so a short page
// doesn't scroll on a phone. `backBeside`: on a wide screen, the way back
// is the page's own to place (beside the content, staying with it), here
// only on narrower ones.
export function InnerPage({
  width = 'md',
  fit = false,
  backBeside = false,
  children,
}: {
  width?: keyof typeof widths;
  fit?: boolean;
  backBeside?: boolean;
  children: ReactNode;
}) {
  return (
    <main className={cn('bg-paper min-h-dvh text-ink', fit && 'flex flex-col')}>
      <SiteHeader home={paths.library}>
        <ButtonLink to={paths.library} variant='pill'>
          <LibraryBig size={15} />
          Your library
        </ButtonLink>
      </SiteHeader>

      <div
        className={cn(
          'mx-auto w-full px-6 pt-4 sm:px-10 sm:pt-10',
          fit ? 'flex flex-1 flex-col pb-8 sm:pb-12' : 'pb-24',
          widths[width],
        )}
      >
        <BackLink
          to={paths.library}
          returns
          // Its own width, not the column's, in a column laid out as flex
          className={cn('mb-7 self-start sm:mb-10', backBeside && 'lg:hidden')}
        />
        {children}
      </div>
    </main>
  );
}
