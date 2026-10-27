import { useEffect, useRef, useState } from 'react';
import { movesTo, useMoveBooks } from '@/entities/book/moves';
import type { Book } from '@/entities/book/types';
import { cn } from '@/shared/lib/cn';
import { counted } from '@/shared/lib/plural';
import { Button } from '@/shared/ui/Button';
import { floatingClass } from '@/shared/ui/surfaces';
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
  const [moved, setMoved] = useState<Moved | null>(null);
  const button = useRef<HTMLButtonElement>(null);
  const picked = books.filter((book) => arranging.picked.has(book.id));
  // The place they're all in, if they're all in the one
  const places = new Set(picked.map((book) => placeKey(book.copy?.place)));
  const here = places.size === 1 ? [...places][0] : undefined;

  // Picking more books ends the word about the last ones, undo and all,
  // the bar now for those
  if (moved && picked.length) setMoved(null);

  useEffect(() => {
    if (!moved) return;
    const done = window.setTimeout(() => setMoved(null), TOLD);
    return () => window.clearTimeout(done);
  }, [moved]);

  const what =
    picked.length === 1
      ? `“${picked[0].title}”`
      : counted(picked.length, 'book');
  // Books on their way, going and coming as useBookMoves has it
  const send = (moves: ReturnType<typeof movesTo>) => {
    arranging.clear();
    motion.move(
      moves.map(({ book }) => book.id),
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
    <div
      // For the way back up to rise over it (BackToTop)
      data-floating-bar={shown || undefined}
      // Hidden, nothing in it to be pressed or reached
      inert={!shown}
      className={cn(
        'fixed inset-x-0 bottom-5 z-30 flex justify-center px-4 transition-[translate,opacity] duration-500 ease-soft sm:bottom-8',
        shown
          ? 'translate-y-0 opacity-100'
          : 'pointer-events-none translate-y-6 opacity-0',
      )}
    >
      <div
        className={cn(
          'flex min-w-0 max-w-full items-center gap-2 rounded-full py-2 pl-5 pr-2 text-sm text-ink sm:gap-3',
          floatingClass,
        )}
      >
        {moved ? (
          <>
            {/* One line, however narrow: cut short rather than wrapping */}
            <span className='min-w-0 truncate'>
              <span className='max-sm:hidden'>{moved.what} moved to </span>
              <span className='sm:hidden'>Moved to </span>
              {moved.where}
            </span>
            <Button
              variant='pill'
              className='shrink-0 whitespace-nowrap'
              onClick={() => {
                send(movesTo(moved.back, (book) => book.copy?.place));
                setMoved(null);
              }}
            >
              Undo
            </Button>
          </>
        ) : (
          <>
            <span className='min-w-0 truncate'>
              {picked.length
                ? `${picked.length} picked`
                : 'Tap books to pick them'}
            </span>
            {picked.length > 0 && (
              <button
                type='button'
                onClick={arranging.clear}
                className='shrink-0 cursor-pointer text-muted transition-colors duration-300 ease-soft hover:text-ink'
              >
                Clear
              </button>
            )}
            <Button
              ref={button}
              disabled={!picked.length}
              onClick={() => setPicking(true)}
              className='min-h-0! shrink-0 whitespace-nowrap px-4! py-2! sm:min-h-0! sm:px-5!'
            >
              Move to…
            </Button>
          </>
        )}
        {/* Done arranging, from here as from the room's own button, the
            bar going with it, whatever it was saying */}
        <Button
          variant='pill'
          className='shrink-0 whitespace-nowrap'
          onClick={() => {
            arranging.turn(false);
            setMoved(null);
          }}
        >
          Done
        </Button>
      </div>
      <MovePicker
        open={picking && picked.length > 0}
        anchor={button}
        title={`Move ${what}`}
        here={here}
        onClose={() => setPicking(false)}
        onPick={put}
      />
    </div>
  );
}
