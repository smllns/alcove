import { useRef } from 'react';
import type { Book } from '@/entities/book/types';
import { cn } from '@/shared/lib/cn';
import { labelClass } from '@/shared/ui/fieldStyles';
import { ArrangeBar } from './ArrangeBar';
import { ArrangeButton } from './ArrangeButton';
import { ArrangingContext, useArranging } from './arranging';
import { CoverShelf } from './CoverShelf';
import { ShelfSheet } from './ShelfSheet';
import { useBookMoves } from './useBookMoves';
import { useFoundBook } from '../room/useFoundBook';

// The books in no place yet, face out on a sheet of their own as a shelf's
// are, to pick and put where they go as the books in a room are (Arrange,
// or a book held on). `found`: one looked for, picked out among them.
export function UnplacedShelf({
  books,
  found,
  className,
}: {
  books: Book[];
  found?: string;
  className?: string;
}) {
  const shelf = useRef<HTMLElement>(null);
  const arranging = useArranging();
  const motion = useBookMoves(shelf, books.map((book) => book.id).join());
  useFoundBook(shelf, found, true);
  return (
    <ArrangingContext value={arranging}>
      <section
        ref={shelf}
        // Room under it for the bar floating over it (ArrangeBar)
        className={cn(
          'flex flex-col gap-4',
          // Coming and going softly, so the page shortening as it goes never
          // pulls it up in a jump
          'transition-[padding] duration-500 ease-soft',
          arranging.on && 'pb-24',
          className,
        )}
      >
        <div className='flex min-h-10 items-center justify-between gap-4'>
          <p className={labelClass}>Not placed yet · {books.length}</p>
          <ArrangeButton arranging={arranging} />
        </div>
        <ShelfSheet>
          <CoverShelf books={books} />
        </ShelfSheet>
        <ArrangeBar arranging={arranging} books={books} motion={motion} />
      </section>
    </ArrangingContext>
  );
}
