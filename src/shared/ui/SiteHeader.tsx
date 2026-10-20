import type { ReactNode } from 'react';
import { ThemeToggle } from '@/shared/theme';
import { cn } from '@/shared/lib/cn';
import { Logo } from './Logo';

type SiteHeaderProps = {
  // Page-specific actions, shown after the theme toggle
  children?: ReactNode;
  className?: string;
  // Where the logo leads; inside the app, that's the library
  home?: string;
};

export function SiteHeader({ children, className, home }: SiteHeaderProps) {
  return (
    <header
      className={cn(
        'pointer-events-auto flex items-center justify-between px-5 py-4 sm:px-10 sm:py-8 lg:px-16',
        className,
      )}
    >
      <Logo to={home} />
      <div className='flex items-center gap-2 sm:gap-2.5'>
        <ThemeToggle />
        {children}
      </div>
    </header>
  );
}
