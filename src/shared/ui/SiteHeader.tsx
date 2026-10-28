import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';
import { Logo } from './Logo';

type SiteHeaderProps = {
  // The page's own buttons, on the right (for guests, the theme toggle
  // among them; once signed in, it's in settings)
  children?: ReactNode;
  // Just after the logo (the search, in the app)
  beside?: ReactNode;
  className?: string;
  // Where the logo leads; inside the app, that's the library
  home?: string;
};

// The bar itself lets the pointer through to whatever is behind it (the
// landing scene, the sky of books); only the logo and buttons catch it
export function SiteHeader({
  children,
  beside,
  className,
  home,
}: SiteHeaderProps) {
  return (
    <header
      className={cn(
        'pointer-events-none flex items-center justify-between px-5 py-4 sm:px-10 sm:py-8 lg:px-16',
        className,
      )}
    >
      <Logo to={home} className='pointer-events-auto' />
      {beside}
      <div className='pointer-events-auto ml-auto flex items-center gap-2 sm:gap-2.5'>
        {children}
      </div>
    </header>
  );
}
