import type { RefObject } from 'react';
import { seedOf } from '@/shared/lib/seed';
import { SectionNotes } from './SectionNotes';
import { SectionWall } from './SectionWall';
import { SLAB, UNDER, WALL } from './section';
import { useMeasured } from './useMeasured';

// The house drawn as an architect's section through it, over its rooms
// (each marked data-room): what's cut through solid (the roof following
// its pitch, the slab under it, the outer walls, the floors between the
// storeys and the walls between rooms), the ground hatched under it, a
// line under that with a tick at every wall, a scale bar and the title
// block (SectionNotes). Measured off the rooms as laid out, and drawn again
// only when the house changes size.

type Box = { x: number; y: number; right: number; bottom: number };
type Shape = { width: number; rooms: Box[] };

const measure = (house: HTMLElement): Shape => {
  const box = house.getBoundingClientRect();
  return {
    width: box.width,
    rooms: Array.from(house.querySelectorAll('[data-room]'), (room) => {
      const at = room.getBoundingClientRect();
      return {
        x: at.left - box.left,
        y: at.top - box.top,
        right: at.right - box.left,
        bottom: at.bottom - box.top,
      };
    }),
  };
};

// How thick the walls between rooms and the roof are where they're cut
// through (the rest: section.ts); how far the roof reaches past the walls,
// and how high its ridge is
const PARTITION = 2.5;
const ROOF = 7;
const EAVES = 22;
const RIDGE = 10;

const poche = { fill: 'var(--poche)' } as const;

export function HouseSketch({
  house,
  roof,
  name,
  books,
}: {
  house: RefObject<HTMLDivElement | null>;
  // How tall the roof is, over the rooms
  roof: number;
  name: string;
  books: number;
}) {
  const shape = useMeasured(house, measure);
  if (!shape?.rooms.length) return null;
  const { width: w, rooms } = shape;
  const ground = Math.max(...rooms.map((room) => room.bottom)) + SLAB;
  // The storeys' floors, each under the rooms of its storey
  const floors = [...new Set(rooms.map((room) => Math.round(room.bottom)))];
  const groundFloor = rooms.filter(
    (room) => Math.round(room.bottom) === floors.at(-1),
  );
  // A window in the outer wall of some storeys, picked by the home, a
  // little way down from each storey's ceiling
  const storeys = [...new Set(rooms.map((room) => Math.round(room.y)))];
  const windows = (side: string) =>
    storeys.flatMap((top, i): [number, number][] => {
      const tall = Math.min(90, ((floors[i] ?? top) - top) * 0.45);
      return seedOf(`${name}:${side}:${i}`) < 0.6
        ? [[top + 44, top + 44 + tall]]
        : [];
    });

  return (
    <svg
      aria-hidden
      className='pointer-events-none absolute left-0 top-0 z-3 overflow-visible'
      width={w}
      height={ground + UNDER}
    >
      <defs>
        <pattern
          id='section-hatch'
          width='7'
          height='7'
          patternUnits='userSpaceOnUse'
          patternTransform='rotate(45)'
        >
          <line y2='7' stroke='var(--hatch)' strokeWidth='0.8' />
        </pattern>
      </defs>
      {/* The roof, cut along its pitch, and the slab it stands on */}
      <path
        d={`M${-WALL - EAVES} ${roof}L${w / 2} ${RIDGE}L${w + WALL + EAVES} ${roof}`}
        fill='none'
        stroke='var(--poche)'
        strokeWidth={ROOF}
        strokeLinejoin='miter'
      />
      <rect
        x={-WALL}
        y={roof - SLAB}
        width={w + 2 * WALL}
        height={SLAB}
        {...poche}
      />
      {/* The outer walls, a window in some storeys, and the floors */}
      <SectionWall
        x={-WALL}
        width={WALL}
        top={roof - SLAB}
        bottom={ground}
        windows={windows('left')}
      />
      <SectionWall
        x={w}
        width={WALL}
        top={roof - SLAB}
        bottom={ground}
        windows={windows('right')}
      />
      {floors.map((y) => (
        <rect
          key={y}
          x={-WALL}
          y={y}
          width={w + 2 * WALL}
          height={SLAB}
          {...poche}
        />
      ))}
      {/* Between rooms side by side */}
      {rooms
        .filter((room) => room.x > 2)
        .map((room) => (
          <rect
            key={`${room.x},${room.y}`}
            x={room.x - PARTITION / 2}
            y={room.y}
            width={PARTITION}
            height={room.bottom - room.y}
            {...poche}
          />
        ))}
      <SectionNotes
        width={w}
        ground={ground}
        walls={[0, ...groundFloor.map((room) => Math.round(room.right))]}
        name={name}
        rooms={rooms.length}
        books={books}
      />
    </svg>
  );
}
