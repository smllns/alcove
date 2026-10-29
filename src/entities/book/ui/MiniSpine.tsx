import type { CSSProperties } from 'react';
import { cn } from '@/shared/lib/cn';
import { useSpineColour } from '../coverTone';
import { spineSize } from '../spine';
import type { Book } from '../types';

// How much smaller than on a shelf of its own a book is drawn
const SCALE = 1 / 2.5;

// A book drawn small, in its cover's colour, quietened into the drawing
// (.mini-spine, styles/places.css; or `className`'s own): standing, as on
// a shelf, or lying, as in a pile; `grow` times as large. `pending`: its
// colour while its cover's colour is still being found (useSpineColour).
export function MiniSpine({
  book,
  lying,
  grow = 1,
  className = 'mini-spine',
  pending,
}: {
  book: Book;
  lying?: boolean;
  grow?: number;
  className?: string;
  pending?: string;
}) {
  const colour = useSpineColour(book, pending);
  const { width, height } = spineSize(book);
  const [w, h] = [
    Math.max(2, Math.round(width * SCALE * grow)),
    Math.round(height * SCALE * grow),
  ];
  return (
    <span
      className={cn(className, 'block shrink-0 rounded-[1px]')}
      style={
        {
          width: lying ? h : w,
          height: lying ? w : h,
          '--tone': colour,
        } as CSSProperties
      }
    />
  );
}
