import type { CSSProperties } from 'react';
import type { Book } from '@/entities/book/types';
import { cn } from '@/shared/lib/cn';
import { counted } from '@/shared/lib/plural';
import type { Thing } from '../drawing/decor';
import { Piece } from '../drawing/Piece';
import { MiniPiles } from '../drawing/RoomMiniature';
import { SLAB } from '../drawing/section';

// A home's attic, under its roof. With books in it (kept in the home but
// in no room): a pile of them, labelled as the rooms are, under a lamp
// hanging from the ridge, lit (its light: AtticLight) and opened as a
// room is (house-room, styles/places.css). Without, just that all the
// books are on shelves, or that the home has none.
export function HouseAttic({
  lamp,
  books,
  homeEmpty,
  onOpen,
}: {
  // Its lamp (atticOf), its light's colour set on the drawing round it
  lamp: Thing;
  books: Book[];
  // No books anywhere in the home
  homeEmpty: boolean;
  onOpen: () => void;
}) {
  // Down to the attic's floor, the slab over the rooms, what's in it lying
  // on it
  const fill = 'relative flex size-full items-end justify-center pb-(--slab)';
  const hanging = (
    <span
      aria-hidden
      className='absolute left-1/2 top-3 flex -translate-x-1/2 flex-col items-center'
    >
      <span className='h-6 w-px bg-(--fine)' />
      <Piece thing={lamp} />
    </span>
  );
  const label = 'text-[10px] uppercase tracking-[0.16em]';
  if (!books.length)
    return (
      <div
        className={cn('absolute inset-0', fill)}
        style={{ '--slab': `${SLAB}px` } as CSSProperties}
      >
        {/* Higher up, in the middle of the gable */}
        <span className={cn('pb-8 text-muted', label)}>
          {homeEmpty ? 'No books in this home' : 'All books on shelves'}
        </span>
      </div>
    );
  return (
    // The room's own place under the roof, the whole of it, as a room
    // (house-room) is placed by the flow, not laid over it
    <div className='absolute inset-0'>
      <button
        type='button'
        onClick={onOpen}
        className={cn('house-room house-attic cursor-pointer', fill)}
        style={{ '--slab': `${SLAB}px` } as CSSProperties}
      >
        {hanging}
        <span className='relative flex min-w-0 max-w-full items-end gap-3 px-8'>
          {/* As the rooms are labelled: its name, its books under it */}
          <span className='flex flex-col items-start gap-1 pb-3 text-[10px]'>
            <span className='uppercase tracking-[0.16em] text-ink'>
              Not sorted
            </span>
            <span className='font-mono text-muted'>
              {counted(books.length, 'book')}
            </span>
          </span>
          <MiniPiles books={books} grow={1.15} className='max-w-48' />
        </span>
      </button>
    </div>
  );
}
