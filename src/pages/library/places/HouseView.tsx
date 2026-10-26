import { useRef } from 'react';
import type { HomeBooks } from './arrange';
import { furnish } from './decor';
import { HouseRoom } from './HouseRoom';
import { useCurrentRoom } from './useCurrentRoom';
import { HouseSketch } from './HouseSketch';
import { SLAB, UNDER } from './section';
import { MiniPile } from './RoomMiniature';
import { useMediaQuery } from '@/shared/lib/useMediaQuery';
import { counted } from '@/shared/lib/plural';

// Kept in the home but in no room: by the door, opened like a room
export const LOOSE = 'loose';
// How tall the roof is, over the rooms
const ROOF = 96;

// A home drawn as an architect's section through it (HouseSketch): its
// name under the roof, its rooms storey over storey (as many side by side
// as the screen has room for), each numbered, its bookcases standing in
// it, and any books in no room in a pile by the door.
export function HouseView({
  home,
  rooms,
  loose,
  count,
  onOpen,
}: HomeBooks & {
  onOpen: (room: string) => void;
}) {
  const house = useRef<HTMLDivElement>(null);
  useCurrentRoom(house, rooms);
  const narrow = useMediaQuery('(max-width: 639px)');
  const middling = useMediaQuery('(max-width: 1023px)');
  const perFloor = narrow ? 1 : middling ? 2 : 3;
  const decors = furnish(rooms.map(({ room }) => room.id));
  const floors = Array.from(
    { length: Math.ceil(rooms.length / perFloor) },
    (_, i) => rooms.slice(i * perFloor, (i + 1) * perFloor),
  );

  return (
    <div className='flex flex-col gap-8 sm:flex-row sm:items-end'>
      <div
        ref={house}
        className='relative min-w-0 flex-1'
        // Room under it for the ground and the drawing's notes
        style={{ paddingBottom: UNDER }}
      >
        {/* Under the roof, the home's name, in the gable */}
        <div
          className='relative z-4 flex items-end justify-center pb-5'
          style={{ height: ROOF }}
        >
          <p className='text-[11px] uppercase tracking-[0.24em] text-muted'>
            {home.name}
          </p>
        </div>
        {floors.map((floor, f) => (
          // A floor's slab under each storey
          <div
            key={floor[0].room.id}
            className='flex'
            style={{ marginBottom: SLAB }}
          >
            {floor.map(({ room, ...inside }, i) => (
              <HouseRoom
                key={room.id}
                number={f * perFloor + i + 1}
                decor={decors.get(room.id)!}
                name={room.name}
                {...inside}
                onOpen={() => onOpen(room.id)}
              />
            ))}
          </div>
        ))}
        {!rooms.length && (
          <p data-room className='px-5 py-16 text-center text-sm text-muted'>
            No rooms here yet.
          </p>
        )}
        <HouseSketch house={house} roof={ROOF} name={home.name} books={count} />
      </div>

      {loose.length > 0 && (
        <button
          type='button'
          onClick={() => onOpen(LOOSE)}
          className='flex shrink-0 cursor-pointer flex-col items-start gap-2 rounded-xl p-3 text-left transition-colors duration-500 ease-soft hover:bg-surface/60'
        >
          <MiniPile books={loose} />
          <span className='text-xs text-muted'>
            By the door · {counted(loose.length, 'book')}
          </span>
        </button>
      )}
    </div>
  );
}
