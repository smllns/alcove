import { useRef, type ReactNode } from 'react';
import type { Book } from '@/entities/book/types';
import { cn } from '@/shared/lib/cn';
import { counted } from '@/shared/lib/plural';
import { solidRaisedClass } from '@/shared/ui/surfaces';
import { BooksCard } from './BooksCard';
import { GONE_MS, useCardPlace } from './useCardPlace';
import type { GroupPage } from './useBooksDrawer';
import { useTransitionNavigate } from '@/shared/lib/useTransitionNavigate';
import { useLingering } from '@/shared/lib/useLingering';

// A group of books drawn in the stats (a month's bay, a decade's pile), opening
// them to choose from: pointed at (`hover`), in a card over it, its spines
// rising a touch (theirs to do, `group-hover/books`); otherwise, tapped, in a
// drawer (`onOpen`). The card headed `heading`, with `meta` beside it (how many
// books, unless said otherwise), and a word on each book (`detail`), if given.
// `over`: what's written over the drawing. Where the card opens is
// useCardPlace's to say.
export function HoverBooks({
  heading,
  books,
  meta = counted(books.length, 'book'),
  hover,
  onOpen,
  over,
  detail,
  page,
  className,
  children,
}: {
  heading: string;
  books: Book[];
  meta?: string;
  hover: boolean;
  onOpen: () => void;
  over?: ReactNode;
  detail?: (book: Book) => string;
  // Its own page (an author's): clicked, pointed at, the group goes there,
  // and its card says the way
  page?: GroupPage;
  className?: string;
  children: ReactNode;
}) {
  const card = useRef<HTMLDivElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const place = useCardPlace(card, scroller);
  const navigate = useTransitionNavigate();
  // Made only while pointed at, and as it fades once left: one for every
  // group on the page, each with all its books, made the page slow
  const carded = useLingering(place.pointed, GONE_MS);
  return (
    <div
      className={cn('group/books relative flex flex-col hover:z-30', className)}
      onPointerEnter={(e) => place.enter(e.currentTarget)}
      onPointerLeave={place.leave}
    >
      {over}
      <button
        type='button'
        disabled={!books.length}
        aria-label={`${heading} · ${meta}`}
        // Pointed at, the books open over it of themselves, and a click
        // goes on to its own page, if it has one
        onClick={() =>
          !hover ? onOpen() : page && void navigate(page.to, 'forward')
        }
        className='flex cursor-pointer flex-col disabled:cursor-default'
      >
        {children}
      </button>
      {hover && carded && books.length > 0 && (
        // Where useCardPlace says, from the group's top and middle
        <div
          ref={card}
          data-under={place.under || undefined}
          style={{ top: place.top, marginLeft: place.shift }}
          className={cn(
            // Faded in from nothing as it's made (stats.css)
            'books-card',
            // Coming only once the pointer rests on it, so passing over a
            // row, or the page, doesn't flash every group open
            'invisible absolute left-1/2 z-30 -translate-x-1/2 opacity-0 transition-[opacity,visibility] duration-500 ease-soft group-hover/books:visible group-hover/books:opacity-100 group-hover/books:delay-[400ms]',
          )}
        >
          <div
            className={cn(
              'w-80 rounded-2xl px-5 pb-2.5 pt-5 transition-[translate] duration-700 ease-soft group-hover/books:translate-y-0',
              // Rising into place over it, settling down into place under it
              place.under ? '-translate-y-2' : 'translate-y-2',
              // Solid: a frosted one fades in see-through, its blur only
              // coming at the very end, in a jump
              solidRaisedClass,
            )}
          >
            <BooksCard
              heading={heading}
              meta={meta}
              books={books}
              scroller={scroller}
              room={place.room}
              detail={detail}
              page={page}
            />
          </div>
        </div>
      )}
    </div>
  );
}
