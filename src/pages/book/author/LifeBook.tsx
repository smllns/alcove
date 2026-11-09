import { BookCover } from '@/entities/book/ui/BookCover';
import { cn } from '@/shared/lib/cn';
import { Rating } from '@/shared/ui/Rating';
import { TransitionLink } from '@/shared/ui/TransitionLink';
import { pinPage, type LifePin } from './writerBooks';

// Where a book's name sits over it: over its middle, or near an end of
// the line, running inwards from its edge, so it's never cut off
const placed = {
  start: 'left-0',
  middle: 'left-1/2 -translate-x-1/2',
  end: 'right-0',
};
type NameSide = keyof typeof placed;

// One book on the line of a writer's life (LifeAndWorks), `width` wide:
// the reader's own bright, those read ringed and over the books they're
// fanned out with, the rest quieter. Pointed at (or reached by the
// keyboard), it and its name rise over those beside it, and it opens its
// page; on a touch screen, where nothing's pointed at, a tap hands it over
// instead (`onTap`), to be shown first.
export function LifeBook({
  pin,
  left,
  bottom,
  width,
  side,
  onTap,
}: {
  pin: LifePin;
  left: number;
  bottom: number;
  width: number;
  side: NameSide;
  onTap?: () => void;
}) {
  return (
    <li
      className={cn(
        'absolute hover:z-10 focus-within:z-10',
        pin.read && 'z-[5]',
      )}
      style={{ left, bottom, width }}
    >
      <TransitionLink
        {...pinPage(pin)}
        onClick={(e) => {
          if (!onTap) return;
          e.preventDefault();
          onTap();
        }}
        aria-label={`${pin.title}, ${pin.year}`}
        className='group relative block'
      >
        <BookCover
          title={pin.title}
          url={pin.coverUrl}
          size='S'
          className={cn(
            'w-full shadow-[0_8px_12px_-8px_rgb(var(--shade)/calc(0.5*var(--shade-k)))] transition-[translate,opacity,filter] duration-500 ease-soft group-hover:-translate-y-1 group-focus-visible:-translate-y-1',
            // Read: ringed in the colour reading's marked with above it
            pin.read &&
              'outline-2 outline-offset-[1.5px] outline-[var(--read)]',
            !pin.bookId &&
              'opacity-55 saturate-50 group-hover:opacity-100 group-hover:saturate-100 group-focus-visible:opacity-100 group-focus-visible:saturate-100',
          )}
        />
        {!onTap && (
          <span
            className={cn(
              'pointer-events-none absolute bottom-full mb-2 flex items-center gap-1.5 whitespace-nowrap rounded-md bg-surface px-2 py-0.5 text-xs text-ink opacity-0 shadow-[0_6px_16px_-8px_rgb(var(--shade)/0.5)] transition-opacity duration-500 ease-soft group-hover:opacity-100 group-focus-visible:opacity-100',
              placed[side],
            )}
          >
            {pin.title}
            <span className='text-muted tabular-nums'>{pin.year}</span>
            {pin.rating ? (
              <Rating value={pin.rating} />
            ) : (
              pin.read && <span className='text-muted'>read</span>
            )}
          </span>
        )}
      </TransitionLink>
    </li>
  );
}
