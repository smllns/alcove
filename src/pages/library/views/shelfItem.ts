import type { CSSProperties } from 'react';
import { cn } from '@/shared/lib/cn';

// Only the first cards glide on their own when the shelf rearranges; any
// further down simply cross-fade with the page, which keeps a big library
// quick
const NAMED = 60;

// Props for one book's place in the grid or the list: its name for the
// 'shelf' transition, and, unless the books eased in that way, a rise into
// place, the first screenful one after another (`step` ms apart)
export function shelfItem(
  id: string,
  index: number,
  { rise, step }: { rise: boolean; step: number },
): { className: string; style: CSSProperties } {
  return {
    className: cn('shelf-item', rise && 'animate-rise'),
    style: {
      ...(index < NAMED && { '--shelf-name': `book-${id}` }),
      ...(rise && { animationDelay: `${Math.min(index, 18) * step}ms` }),
    } as CSSProperties,
  };
}
