import type { CSSProperties } from 'react';
import { useSpineColour } from '@/entities/book/coverTone';
import type { Book } from '@/entities/book/types';
import { cn } from '@/shared/lib/cn';

// A book in one of the stats' drawings, in its cover's colour as in a
// list's pile (.list-spine), at whatever size the drawing gives it
export function ToneSpine({
  book,
  style,
  className,
}: {
  book: Book;
  style?: CSSProperties;
  className?: string;
}) {
  const colour = useSpineColour(book, 'var(--spine-pending)');
  return (
    <span
      className={cn('list-spine block shrink-0 rounded-[1px]', className)}
      style={{ ...style, '--tone': colour } as CSSProperties}
    />
  );
}
