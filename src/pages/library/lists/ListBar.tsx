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
import type { Arranging } from '../places/shelf/arranging';

// How long the word that books were taken out stays, with its undo
const TOLD = 6000;

// Floating at the foot of the screen while a list's being changed: how
// many of its books are picked, and a way to take them out of it (off the
// list, not the shelves); once taken out, how many, and a way to put them
// back as they were
export function ListBar({
  picking,
  books,
  onTakeOut,
}: {
  picking: Arranging;
  // Every book in the list, the picked ones among them
  books: Book[];
  // Takes them out, giving back the way to put them back
  onTakeOut: (books: Book[]) => () => void;
}) {
  const [taken, setTaken] = useBriefly<{ count: number; undo: () => void }>(
    TOLD,
  );
  const picked = books.filter((book) => picking.picked.has(book.id));

  // Picking more books ends the word about the last ones, undo and all
  if (taken && picked.length) setTaken(null);

  // Nothing to pick in a list with nothing in it (one just begun, say)
  return (
    <FloatingBar shown={(picking.on && books.length > 0) || Boolean(taken)}>
      {taken ? (
        <>
          {/* One line, however narrow: shorter on a phone */}
          <span className='min-w-0 truncate'>
            <span className='max-sm:hidden'>
              {counted(taken.count, 'book')}
            </span>
            <span className='sm:hidden'>{taken.count}</span> removed
          </span>
          <BarPill
            onClick={() => {
              taken.undo();
              setTaken(null);
            }}
          >
            Undo
          </BarPill>
        </>
      ) : (
        <>
          <PickedTally count={picked.length} onClear={picking.clear} />
          <Button
            disabled={!picked.length}
            onClick={() => {
              picking.clear();
              setTaken({ count: picked.length, undo: onTakeOut(picked) });
            }}
            className={barActionClass}
          >
            Remove
          </Button>
        </>
      )}
      <BarPill
        onClick={() => {
          picking.turn(false);
          setTaken(null);
        }}
      >
        Done
      </BarPill>
    </FloatingBar>
  );
}
