import { useRef } from 'react';
import { cn } from '@/shared/lib/cn';
import { counted } from '@/shared/lib/plural';
import { usePageTurned } from '@/shared/lib/usePageTurned';
import { BackArrowIcon } from '@/shared/ui/ArrowIcon';
import { Button } from '@/shared/ui/Button';
import type { RoomBooks } from '../arrange';
import { ArrangeBar } from '../shelf/ArrangeBar';
import { ArrangeButton } from '../shelf/ArrangeButton';
import { ArrangingContext, useArranging } from '../shelf/arranging';
import type { Decor } from '../drawing/decor';
import { LampLight } from './LampLight';
import { RoomDetails } from './RoomDetails';
import { RoomDrawing } from './RoomDrawing';
import { useFoundBook } from './useFoundBook';
import { useBookMoves } from '../shelf/useBookMoves';

// One room, opened. `drawn` (the places drawn as houses), as an
// architect's sheet: lit by its lamp, the light over the whole screen;
// first the whole room drawn from the front (RoomDrawing), then each
// bookcase again, large, tagged the same, with the books face out on its
// shelves (RoomDetails). Otherwise (the places as cards) plainly, just the
// bookcases and their books.
export function RoomView({
  decor,
  drawn,
  found,
  name,
  backTo,
  onBack,
  units,
  loose,
  count,
}: Omit<RoomBooks, 'room'> & {
  // What it's furnished with (decor.ts)
  decor: Decor;
  drawn: boolean;
  // A book looked for, to find on its shelf
  found?: string;
  name: string;
  // Where its back button goes: its home, or the book it was opened to find
  backTo: string;
  onBack: () => void;
}) {
  const frame = useRef<HTMLElement>(null);
  // Its lamp comes on once the room has opened (room.css), and a book
  // looked for is found then
  const lit = usePageTurned();
  useFoundBook(frame, found, lit);
  // Its books picked out to move elsewhere (ArrangeBar)
  const arranging = useArranging();
  const books = [
    ...units.flatMap((unit) => [
      ...unit.loose,
      ...unit.shelves.flatMap((shelf) => shelf.books),
    ]),
    ...loose,
  ];
  const motion = useBookMoves(frame, books.map((book) => book.id).join());

  return (
    <ArrangingContext value={arranging}>
      <section
        ref={frame}
        data-light={decor.lamp.light}
        data-lit={lit || undefined}
        // Room under the shelves for the bar floating over them (ArrangeBar)
        className={cn(
          'room-frame relative',
          // Coming and going softly, so the page shortening as it goes never
          // pulls it up in a jump
          'transition-[padding] duration-500 ease-soft',
          arranging.on && 'pb-24',
        )}
      >
        {drawn && (
          <>
            <span aria-hidden className='room-wash' />
            <LampLight room={frame} />
          </>
        )}
        <div className='relative flex flex-wrap items-center gap-x-6 gap-y-4'>
          <Button variant='pill' onClick={onBack}>
            <BackArrowIcon />
            {backTo}
          </Button>
          <div className='flex items-baseline gap-x-4'>
            <h2 className='font-serif text-3xl tracking-[-0.03em] text-ink sm:text-4xl'>
              {name}
            </h2>
            <p className='text-sm text-muted'>
              {count ? counted(count, 'book') : 'No books yet'}
            </p>
          </div>
        </div>
        {drawn && <RoomDrawing decor={decor} units={units} loose={loose} />}
        <div
          className={cn('flex min-h-10 justify-end', drawn ? 'mt-10' : 'mt-8')}
        >
          {count > 0 && <ArrangeButton arranging={arranging} />}
        </div>
        <RoomDetails
          units={units}
          loose={loose}
          tagged={drawn}
          className='mt-4'
        />
        <ArrangeBar arranging={arranging} books={books} motion={motion} />
      </section>
    </ArrangingContext>
  );
}
