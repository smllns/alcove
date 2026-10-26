import type { Book } from '@/entities/book/types';
import type { UnitBooks } from './arrange';
import type { Decor } from './decor';
import { MiniBookcase, MiniPile } from './RoomMiniature';
import { RoomFloor } from './RoomFloor';
import { RoomLight, WallDecor } from './WallDecor';

// One room in the section through its home: labelled with its number,
// name and how many books it holds, its bookcases standing on its floor,
// drawn small, books and all, and the things it's furnished with. Opens
// into the room.
export function HouseRoom({
  number,
  decor,
  name,
  units,
  loose,
  count,
  onOpen,
}: {
  // Its number in the home, as on a drawing
  number: number;
  // What it's furnished with (decor.ts)
  decor: Decor;
  name: string;
  units: UnitBooks[];
  loose: Book[];
  count: number;
  onOpen: () => void;
}) {
  return (
    <button
      type='button'
      onClick={onOpen}
      data-room
      data-light={decor.lamp.light}
      // The fuller rooms are the wider
      style={{ flexGrow: Math.max(1, units.length) }}
      className='house-room @container flex min-h-52 min-w-0 basis-0 cursor-pointer flex-col overflow-hidden px-4 text-left sm:px-5'
    >
      <RoomLight decor={decor} />
      {/* Labelled as on a drawing: its number and name, and its books
          in the top corner */}
      <span className='absolute right-4 top-3 z-3 font-mono text-[10px] text-muted sm:right-5'>
        {count}
      </span>
      <WallDecor decor={decor}>
        <span className='relative z-3 flex min-w-0 shrink items-baseline gap-2 pt-3 text-[10px] uppercase tracking-[0.16em]'>
          <span className='text-muted'>{String(number).padStart(2, '0')}</span>
          <span className='truncate text-ink'>{name}</span>
        </span>
      </WallDecor>
      <RoomFloor
        decor={decor}
        fit
        cases={units.map((unit) => (
          <MiniBookcase key={unit.unit.id} {...unit} />
        ))}
        weights={units.map((unit) => unit.count)}
        className='relative mt-auto gap-4 pt-8'
      >
        {loose.length > 0 && <MiniPile books={loose} />}
      </RoomFloor>
    </button>
  );
}
