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
// (the shelves, if from nowhere), and a centred column for the content
export function InnerPage({
  width = 'md',
  children,
}: {
  width?: keyof typeof widths;
  children: ReactNode;
}) {
  return (
    <main className='bg-paper min-h-screen text-ink'>
      <SiteHeader home={paths.library}>
        <ButtonLink to={paths.library} variant='pill'>
          <LibraryBig size={15} />
          Your library
        </ButtonLink>
      </SiteHeader>

      <div
        className={cn(
          'mx-auto w-full px-6 pb-24 pt-4 sm:px-10 sm:pt-10',
          widths[width],
        )}
      >
        <BackLink to={paths.library} returns />
        {children}
      </div>
    </main>
  );
}
