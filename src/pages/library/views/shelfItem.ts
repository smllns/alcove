import type { CSSProperties } from 'react';
import { cn } from '@/shared/lib/cn';

// Only the first cards glide on their own when the shelf rearranges; any
// further down simply cross-fade with the page, which keeps a big library
// quick
const NAMED = 60;

// Props for one book's place in the grid or the list: its names for the
// 'shelf' and 'view' transitions (the card, and its cover), and, unless the
// books eased in that way, a rise into place, the first screenful one after
// another (`step` ms apart). A `faded` book steps back until hovered.
export function shelfItem(
  id: string,
  index: number,
  { rise, step, faded }: { rise: boolean; step: number; faded?: boolean },
): { className: string; style: CSSProperties } {
  return {
    className: cn(
      'shelf-item transition-opacity duration-500 ease-soft',
      rise && 'animate-rise',
      faded && 'shelf-faded',
    ),
    style: {
      ...(index < NAMED && {
        '--shelf-name': `book-${id}`,
        '--cover-name': `cover-${id}`,
      }),
      ...(rise && { animationDelay: `${Math.min(index, 18) * step}ms` }),
    } as CSSProperties,
  };
}
