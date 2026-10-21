import type { CSSProperties, ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';

// The papers the notes come in, and the slants they lie at, taken in turn
const papers = [
  'var(--note-1)',
  'var(--note-2)',
  'var(--note-3)',
  'var(--note-4)',
];
const slants = [-1.6, 1.2, -0.7, 1.8, -1.1];

// How tall a ruled line is (the writing's line height, in StickyNotes), and
// how far down the writing starts
const LINE = 28;
const TOP = 30;

const shade = (alpha: number) =>
  `rgb(var(--shade) / calc(${alpha} * var(--shade-k)))`;

// One sticky note, the `nth` on the page: ruled for writing on, darker
// along its glued strip at the top, its bottom corners curling off the
// page, as tall as what's written. Hovered, it lifts off the page (by its
// position rather than a transform: text moved by a transform, turned as
// it is, is drawn blurred) and comes up over its neighbours, so what it
// shows on its corner isn't hidden under them.
export function Sticky({
  nth,
  children,
  className,
}: {
  nth: number;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      style={
        {
          '--paper': papers[nth % papers.length],
          rotate: `${slants[nth % slants.length]}deg`,
        } as CSSProperties
      }
      className={cn(
        'group relative top-0 transition-[top] duration-500 ease-soft hover:z-10 hover:-top-1.5 focus-within:z-10',
        className,
      )}
    >
      {(['left', 'right'] as const).map((side) => (
        <span
          key={side}
          aria-hidden
          style={{
            [side]: '0.5rem',
            rotate: side === 'left' ? '-4deg' : '4deg',
          }}
          className='absolute bottom-3 h-1/2 max-h-12 w-[45%] shadow-[0_16px_14px_rgb(var(--shade)/calc(0.5*var(--shade-k)))] transition-shadow duration-500 ease-soft group-hover:shadow-[0_22px_18px_rgb(var(--shade)/calc(0.6*var(--shade-k)))]'
        />
      ))}
      <div
        style={{
          boxShadow: `0 1px 2px ${shade(0.12)}`,
          paddingTop: TOP,
          paddingBottom: LINE / 2,
          // A rule under each line of writing, none above the first; the
          // glued strip a touch darker; shading off to the lifting corner
          background: `linear-gradient(to bottom, color-mix(in oklab, var(--paper) 90%, black) 0, var(--paper) 1.75rem, var(--paper) ${TOP}px, transparent ${TOP}px), radial-gradient(circle at 100% 100%, rgb(0 0 0 / 0.07), transparent 45%), repeating-linear-gradient(to bottom, transparent 0 ${LINE - 1}px, color-mix(in oklab, var(--note-ink) 16%, transparent) ${LINE - 1}px ${LINE}px) 0 ${TOP - 6}px / 100% ${LINE}px, var(--paper)`,
        }}
        className='relative min-h-24 px-5 text-(--note-ink)'
      >
        {children}
      </div>
    </div>
  );
}
