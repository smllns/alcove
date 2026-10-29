import { useState, type ReactNode, type RefObject } from 'react';
import { cn } from '@/shared/lib/cn';
import { PHONE, useMediaQuery } from '@/shared/lib/useMediaQuery';
import { Popover } from '@/shared/ui/Popover';
import { SmoothHeight } from '@/shared/ui/SmoothHeight';
import { denseRaisedClass } from '@/shared/ui/surfaces';

// One row in it: a book found, to tap
export const foundRowClass =
  'flex w-full items-center gap-3 rounded-2xl p-2 text-left transition-colors duration-300 ease-soft hover:bg-ink/4 active:bg-ink/6';

// What a search found on a phone, dropping down under the search, as wide
// as the box it's set in (a `relative` one round the search). Tapping in
// it keeps the field typed in, so the keyboard stays up till one's picked.
export function FoundPanel({ children }: { children: ReactNode }) {
  return (
    <div
      onMouseDown={(e) => e.preventDefault()}
      className={cn(
        'absolute inset-x-0 top-full z-20 mt-2 max-h-[min(50dvh,26rem)] animate-rise overflow-y-auto overscroll-contain rounded-3xl p-1.5',
        denseRaisedClass,
      )}
    >
      {children}
    </div>
  );
}

// What's found for a search field (`field`, anchoring the menu by its
// `anchor`), shown by it while `open`: on a phone dropping down under it
// (FoundPanel), elsewhere in a menu beside it `width` wide; growing and
// shrinking softly as what's found comes and goes; opened, shown as it
// is at once, not grown into from nothing
export function FoundBy({
  field,
  anchor,
  open,
  onClose,
  width,
  className,
  children,
}: {
  field: ReactNode;
  anchor: RefObject<HTMLElement | null>;
  open: boolean;
  onClose: () => void;
  width: number;
  className?: string;
  children: ReactNode;
}) {
  const phone = useMediaQuery(PHONE);
  // Each opening a fresh start for what's in it
  const [opened, setOpened] = useState({ open, round: 0 });
  if (opened.open !== open)
    setOpened({ open, round: opened.round + (open ? 1 : 0) });
  const found = <SmoothHeight key={opened.round}>{children}</SmoothHeight>;
  if (phone)
    return (
      <div className={cn('relative', className)}>
        {field}
        {open && <FoundPanel>{found}</FoundPanel>}
      </div>
    );
  return (
    <>
      {field}
      <Popover open={open} anchor={anchor} width={width} onClose={onClose}>
        <div className='min-h-0 overflow-y-auto overscroll-contain px-1.5 pb-2'>
          {found}
        </div>
      </Popover>
    </>
  );
}
