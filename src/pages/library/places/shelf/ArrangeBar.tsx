import { useRef, useState } from 'react';
import { movesTo, useMoveBooks } from '@/entities/book/moves';
import type { Book } from '@/entities/book/types';
import { counted } from '@/shared/lib/plural';
import { useBriefly } from '@/shared/lib/useBriefly';
import { Button } from '@/shared/ui/Button';
import {
  BarPill,
  barActionClass,
  FloatingBar,
  PickedTally,
} from '@/shared/ui/FloatingBar';
import type { Arranging } from './arranging';
import { MovePicker } from './MovePicker';
import type { useBookMoves } from './useBookMoves';
import { placeKey, type Target } from './moveTargets';

// How long the word that books were moved stays, with its undo
const TOLD = 6000;

// What was moved where, and the books as they were, to put them back
type Moved = { what: string; where: string; back: Book[] };

// Floating at the foot of the screen while a room is being arranged: how
// many books are picked, and where to move them (MovePicker); once moved,
// where they went, and a way to put them back
export function ArrangeBar({
  arranging,
  books,
  motion,
}: {
  arranging: Arranging;
  // Every book in the room, the picked ones among them
  books: Book[];
  // How books go and come as they move (useBookMoves)
  motion: ReturnType<typeof useBookMoves>;
}) {
  const move = useMoveBooks();
  const [picking, setPicking] = useState(false);
  const [moved, setMoved] = useBriefly<Moved>(TOLD);
  const button = useRef<HTMLButtonElement>(null);
  const picked = books.filter((book) => arranging.picked.has(book.id));
  // The place they're all in, if they're all in the one
  const places = new Set(picked.map((book) => placeKey(book.copy?.place)));
  const here = places.size === 1 ? [...places][0] : undefined;

  // Picking more books ends the word about the last ones, undo and all,
  // the bar now for those
  if (moved && picked.length) setMoved(null);

  const what =
    picked.length === 1
      ? `“${picked[0].title}”`
      : counted(picked.length, 'book');
  // Books on their way, going and coming as useBookMoves has it
  const send = (moves: Book[]) => {
    arranging.clear();
    motion.move(
      moves.map((book) => book.id),
      () => move.mutate(moves),
    );
  };
  const put = (target: Target) => {
    setPicking(false);
    send(movesTo(picked, () => target.place));
    setMoved({
      what: counted(picked.length, 'book'),
      where: target.where,
      back: picked,
    });
  };

  const shown = arranging.on || Boolean(moved);
  return (
    <FloatingBar shown={shown}>
      {moved ? (
        <>
          {/* One line, however narrow: cut short rather than wrapping */}
          <span className='min-w-0 truncate'>
            <span className='max-sm:hidden'>{moved.what} moved to </span>
            <span className='sm:hidden'>Moved to </span>
            {moved.where}
          </span>
          <BarPill
            onClick={() => {
              send(movesTo(moved.back, (book) => book.copy?.place));
              setMoved(null);
            }}
          >
            Undo
          </BarPill>
        </>
      ) : (
        <>
          <PickedTally count={picked.length} onClear={arranging.clear} />
          <Button
            ref={button}
            disabled={!picked.length}
            onClick={() => setPicking(true)}
            className={barActionClass}
          >
            Move to…
          </Button>
        </>
      )}
      {/* Done arranging, from here as from the room's own button, the
            bar going with it, whatever it was saying */}
      <BarPill
        onClick={() => {
          arranging.turn(false);
          setMoved(null);
        }}
      >
        Done
      </BarPill>
      <MovePicker
        open={picking && picked.length > 0}
        anchor={button}
        title={`Move ${what}`}
        here={here}
        onClose={() => setPicking(false)}
        onPick={put}
      />
    </FloatingBar>
  );
}
