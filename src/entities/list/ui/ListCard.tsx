import { clothFor } from '@/entities/book/coverImage';
import { cn } from '@/shared/lib/cn';
import { counted } from '@/shared/lib/plural';
import { outlineCardClass } from '@/shared/ui/surfaces';

// How the three books of the little stack lean, back to front
const LEANS = [-9, 4, -2];

// A list of books, as a card: a small stack of books in cloths of its own
// (the same for the same name every time), its name, how many books are
// in it and whose it is. Still only to look at; one day it opens the
// list's own page.
export function ListCard({
  name,
  books,
  whose,
  className,
}: {
  name: string;
  books: number;
  // Who keeps it: "Yours", "Open Library", a reader's name
  whose: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        outlineCardClass,
        'flex items-center gap-4 bg-surface/35 px-4 py-3.5',
        className,
      )}
    >
      <span aria-hidden className='relative h-11 w-10 shrink-0'>
        {LEANS.map((lean, i) => (
          <span
            key={i}
            className='absolute bottom-0 h-10 w-7 rounded-[2px] shadow-[0_4px_8px_-4px_rgb(var(--shade)/calc(0.5*var(--shade-k)))]'
            style={{
              backgroundColor: clothFor(`${name}${i}`),
              rotate: `${lean}deg`,
              // Side by side a little, about the middle (a book is 1.75rem)
              left: `calc(50% - 0.875rem + ${(i - 1) * 5}px)`,
            }}
          />
        ))}
      </span>
      <span className='min-w-0 flex-1'>
        <span className='block truncate font-serif text-[17px] leading-snug tracking-[-0.01em] text-ink'>
          {name}
        </span>
        <span className='mt-0.5 block truncate text-xs text-muted'>
          {counted(books, 'book')} · {whose}
        </span>
      </span>
    </div>
  );
}
