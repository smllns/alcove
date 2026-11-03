import { useRef, type ReactNode } from 'react';
import type { Book } from '@/entities/book/types';
import { cn } from '@/shared/lib/cn';
import { counted } from '@/shared/lib/plural';
import { solidRaisedClass } from '@/shared/ui/surfaces';
import { BooksCard } from './BooksCard';
import { useCardPlace } from './useCardPlace';
import type { CardSide } from './cardSide';

const sides: Record<CardSide, string> = {
  start: 'left-0',
  end: 'right-0',
  middle: 'left-1/2 -translate-x-1/2',
};

// A group of books drawn in the stats (a month's bay, a decade's pile), opening
// them to choose from: pointed at (`hover`), in a card over it, its spines
// rising a touch (theirs to do, `group-hover/books`); otherwise, tapped, in a
// drawer (`onOpen`). The card headed `heading`, with `meta` beside it (how many
// books, unless said otherwise), and a word on each book (`detail`), if given.
// `over`: what's written over the drawing, which the card doesn't cover. Where
// the card opens, and how it moves as the page scrolls, is useCardPlace's to
// say.
export function HoverBooks({
  heading,
  books,
  meta = counted(books.length, 'book'),
  side,
  hover,
  onOpen,
  over,
  detail,
  className,
  children,
}: {
  heading: string;
  books: Book[];
  meta?: string;
  side: CardSide;
  hover: boolean;
  onOpen: () => void;
  over?: ReactNode;
  detail?: (book: Book) => string;
  className?: string;
  children: ReactNode;
}) {
  const card = useRef<HTMLDivElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const place = useCardPlace(card, scroller);
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
        // Pointed at, the books open over it of themselves
        onClick={() => !hover && onOpen()}
        className='flex cursor-pointer flex-col disabled:cursor-default'
      >
        {children}
      </button>
      {hover && books.length > 0 && (
        // Over it (or under it), the gap between bridged, so the pointer
        // can go into it
        <div
          ref={card}
          className={cn(
            // Coming a moment after the pointer stops on it, so passing
            // over a row doesn't flash every group open
            'invisible absolute z-30 opacity-0 transition-[opacity,visibility] duration-500 ease-soft group-hover/books:visible group-hover/books:opacity-100 group-hover/books:delay-100',
            place.under ? 'top-full pt-3' : 'bottom-full pb-3',
            sides[side],
            // Moving across on screen: gone at once, to come back there
            place.moving && 'opacity-0! delay-0! duration-200!',
          )}
        >
          <div
            className={cn(
              'w-80 rounded-2xl px-5 pb-2.5 pt-5 transition-[translate] duration-700 ease-soft group-hover/books:translate-y-0',
              // Rising into place over it, settling down into it under it
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
            />
          </div>
        </div>
      )}
    </div>
  );
}
