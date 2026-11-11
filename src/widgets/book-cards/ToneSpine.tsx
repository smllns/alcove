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

// A spine standing in a drawing, `height` tall, rising a touch and
// brightening as its group is pointed at (`group-hover/books`); `small`,
// rising less, for the finest. Its width is the drawing's (`className`).
export function RisingSpine({
  book,
  height,
  small = false,
  className,
}: {
  book: Book;
  height: number;
  small?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'block transition-[translate,filter] duration-700 ease-soft group-hover/books:brightness-110',
        small
          ? 'group-hover/books:-translate-y-0.5'
          : 'group-hover/books:-translate-y-1',
        className,
      )}
      style={{ height }}
    >
      <ToneSpine book={book} className='size-full' />
    </span>
  );
}
