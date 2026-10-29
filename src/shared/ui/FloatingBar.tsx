import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/shared/lib/cn';
import { Button } from './Button';
import { floatingClass } from './surfaces';

// A bar floating at the foot of the screen while something's being done
// (books picked to move, or to take out of a list): sliding up into view
// when `shown`, and away again, out of reach while hidden. Put straight
// into the page's body, so nothing it's set in (a frosted sheet, which
// holds what's fixed inside it) keeps it from the foot of the screen.
export function FloatingBar({
  shown,
  children,
}: {
  shown: boolean;
  children: ReactNode;
}) {
  return createPortal(
    <div
      // For the way back up to rise over it (BackToTop)
      data-floating-bar={shown || undefined}
      inert={!shown}
      className={cn(
        'fixed inset-x-0 bottom-5 z-30 flex justify-center px-4 transition-[translate,opacity] duration-500 ease-soft sm:bottom-4',
        shown
          ? 'translate-y-0 opacity-100'
          : 'pointer-events-none translate-y-6 opacity-0',
      )}
    >
      <div
        className={cn(
          'flex min-w-0 max-w-full items-center gap-2 rounded-full py-2 pl-5 pr-2 text-sm text-ink sm:gap-3',
          floatingClass,
        )}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}

// On such a bar, how many books are picked, or that tapping picks them,
// and a way to let them all go
export function PickedTally({
  count,
  onClear,
}: {
  count: number;
  onClear: () => void;
}) {
  return (
    <>
      <span className='min-w-0 truncate'>
        {count ? `${count} picked` : 'Tap books to pick them'}
      </span>
      {count > 0 && (
        <button
          type='button'
          onClick={onClear}
          className='shrink-0 cursor-pointer text-muted transition-colors duration-300 ease-soft hover:text-ink'
        >
          Clear
        </button>
      )}
    </>
  );
}

// The bar's main button (Move to…, Remove), as compact as the bar
export const barActionClass =
  'min-h-0! shrink-0 whitespace-nowrap px-4! py-2! sm:min-h-0! sm:px-5!';

// A quiet pill on the bar, never wrapping (Undo, Done)
export function BarPill({
  onClick,
  children,
}: {
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <Button
      variant='pill'
      className='shrink-0 whitespace-nowrap'
      onClick={onClick}
    >
      {children}
    </Button>
  );
}
