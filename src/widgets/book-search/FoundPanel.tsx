import { useRef, useState, type ReactNode, type RefObject } from 'react';
import { cn } from '@/shared/lib/cn';
import { useTapAway } from '@/shared/lib/useTapAway';
import { PHONE, useMediaQuery } from '@/shared/lib/useMediaQuery';
import { Popover } from '@/shared/ui/Popover';
import { SmoothHeight } from '@/shared/ui/SmoothHeight';
import { denseRaisedClass, solidRaisedClass } from '@/shared/ui/surfaces';

// One row in it: a book found, to tap
export const foundRowClass =
  'flex w-full items-center gap-3 rounded-2xl p-2 text-left transition-colors duration-300 ease-soft hover:bg-ink/4 active:bg-ink/6';

// What a search found on a phone, dropping down under the search. Tapping
// in it keeps the field typed in, so the keyboard stays up till one's
// picked. Over what's below it, as wide as the box it's set in (a
// `relative` one round the search); or `inFlow`, a part of the page, the
// sheet it's on growing to hold it and the page scrolling on down to the
// rest of it, paper all through.
export function FoundPanel({
  inFlow = false,
  children,
}: {
  inFlow?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      onMouseDown={(e) => e.preventDefault()}
      className={cn(
        'mt-2 animate-rise rounded-3xl p-1.5',
        inFlow
          ? solidRaisedClass
          : cn(
              'absolute inset-x-0 top-full z-20 max-h-[min(50dvh,26rem)] overflow-y-auto overscroll-contain',
              denseRaisedClass,
            ),
      )}
    >
      {children}
    </div>
  );
}

// What's found for a search field (`field`, anchoring the menu by its
// `anchor`), shown by it while `open`: on a phone dropping down under it
// as a part of the page (FoundPanel), let go only by a tap somewhere else
// (never as the keyboard goes: the field's done with, not the search),
// elsewhere in a menu beside it `width` wide; growing and
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
  const box = useRef<HTMLDivElement>(null);
  // A tap anywhere but the field and what it found lets it go
  useTapAway(phone && open, [box], onClose);
  if (phone)
    return (
      <div ref={box} className={className}>
        {field}
        {open && <FoundPanel inFlow>{found}</FoundPanel>}
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
