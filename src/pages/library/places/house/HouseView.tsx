import { useRef } from 'react';
import { LOOSE, type HomeBooks } from '../arrange';
import { atticOf, furnish } from '../drawing/decor';
import { HouseRoom } from './HouseRoom';
import { useCurrentRoom } from './useCurrentRoom';
import { HouseSketch } from './HouseSketch';
import { SLAB, UNDER } from '../drawing/section';
import { HouseAttic } from './HouseAttic';
import { useMediaQuery } from '@/shared/lib/useMediaQuery';

// How tall the roof is, over the rooms, its attic under it
const ROOF = 120;

// A home drawn as an architect's section through it (HouseSketch): its
// name under the roof, its rooms storey over storey (as many side by side
// as the screen has room for), each numbered, its bookcases standing in
// it, and under the roof its attic, with any books in no room in a pile
// there (HouseAttic).
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

  const attic = atticOf(
    home.id,
    rooms.map(({ room }) => room.id),
  );

  return (
    // The attic's light the colour for the drawing round the rooms, each
    // room with its own
    <div data-light={attic.lamp.light} className='house-plan flex flex-col'>
      <div
        ref={house}
        className='relative min-w-0'
        // Room under it for the ground and the drawing's notes
        style={{ paddingBottom: UNDER }}
      >
        <div className='relative z-4' style={{ height: ROOF }}>
          <HouseAttic
            lamp={attic.lamp}
            books={loose}
            homeEmpty={!count}
            onOpen={() => onOpen(LOOSE)}
          />
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
    </div>
  );
}
