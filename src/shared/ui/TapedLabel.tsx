import type { CSSProperties, ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';
import { paperClass } from './surfaces';

// Tape: see-through, in a colour, with a soft sheen where it catches the
// light
const tape = (tone: string) =>
  [
    'linear-gradient(to bottom, rgb(255 255 255 / 0.3), transparent 45%, rgb(255 255 255 / 0.12))',
    `color-mix(in oklab, ${tone} 45%, transparent)`,
  ].join(', ');

// Where the tape was torn off the roll: straight along its length, each
// end ripped a little crooked, a different way for each piece
const torn = [
  'polygon(2% 0, 100% 0, 97% 100%, 0 100%)',
  'polygon(0 0, 97% 0, 100% 100%, 3% 100%)',
  'polygon(0 0, 100% 0, 98% 60%, 100% 100%, 1% 100%, 3% 35%)',
];

// A paper label taped on with a strip of washi tape, a touch askew: a dot
// of its colour (`tone`) and the words. Hovered, it lifts and straightens a
// little. For where the reader is with a book (read, reading, lent out).
export function TapedLabel({
  tone,
  tilt = 0,
  piece = 0,
  children,
}: {
  tone: string;
  // Degrees it sits askew
  tilt?: number;
  // Which torn piece of tape holds it, for labels side by side to differ
  piece?: number;
  children: ReactNode;
}) {
  return (
    <span
      style={{ '--tone': tone, '--tilt': `${tilt}deg` } as CSSProperties}
      // Drawn as one layer as it moves, so the dot and the words turn with
      // it smoothly instead of snapping from pixel to pixel
      className='group relative inline-flex rotate-(--tilt) transition-[rotate,translate] duration-500 ease-soft will-change-transform hover:-translate-y-0.5 hover:rotate-[calc(var(--tilt)/3)]'
    >
      <span
        aria-hidden
        style={{
          background: tape(tone),
          clipPath: torn[piece % torn.length],
        }}
        className='absolute -top-2.5 left-1/2 z-10 h-5 w-14 -translate-x-1/2 -rotate-3'
      />
      <span
        className={cn(
          'flex items-center gap-2 whitespace-nowrap rounded-xs px-4 pb-2.5 pt-3.5 text-[11.5px] font-semibold uppercase leading-tight tracking-[0.12em] text-ink transition-shadow duration-500 ease-soft group-hover:shadow-[0_1px_2px_rgb(var(--shade)/calc(0.15*var(--shade-k))),0_16px_22px_-14px_rgb(var(--shade)/calc(0.55*var(--shade-k)))]',
          paperClass,
        )}
      >
        <span
          aria-hidden
          className='size-2 shrink-0 rounded-full bg-(--tone)'
        />
        {children}
      </span>
    </span>
  );
}
