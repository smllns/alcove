import { seedOf } from '@/shared/lib/seed';
import type { HomeBooks } from '../places/arrange';
import { BookStack, Bookcase } from './BookShapes';
import { booksIn, figures, stacked, stampOf } from './libraryStats';
import { Ground, LevelMark, SectionDefs, WallWindow } from './drawing';
import { RoomLamp } from './RoomLamp';
import { TitleBlock } from './TitleBlock';
import { UNDER, WALL, useDrawingIds } from './drawingKit';
import { atticOf, furnish } from '../places/drawing/decor';
import { ROOF, ROOMS_PER_STOREY, STOREY, inHome } from './measured';

// The drawing's measures, in its own units: a metre, where the ground is,
// where the home starts, how wide a room is and how thick the walls; the
// same for every home, so one home's stack can be set against another's
const M = 30;
const G = 400;
const X = 24;
const ROOM = 5 * M;
const WIDE = ROOMS_PER_STOREY * ROOM;
const [SX, SW] = [X + WIDE + 50, 44];
const SHELF = 0.38 * M;
// How large the places' lamps are drawn, against the plan of a home
const LAMP = M / 30;

// The books on a bookcase's shelves, and those only as far as the
// bookcase on its lowest
const shelvesOf = ({ shelves, loose }: HomeBooks['rooms'][0]['units'][0]) => [
  [...loose, ...(shelves[0]?.books ?? [])],
  ...shelves.slice(1, 5).map((shelf) => shelf.books),
];

// One of the reader's homes drawn as the places draw it, in section, its
// rooms two to a storey with their lamps and bookcases, and beside it the
// books kept there stacked up: the room the stack comes up to lit, a gold
// line from its top across to the room, its height by it. Taller than the
// home and its roof, the stack is broken off, its height still true.
// On a phone the rooms are only numbered, their names too small to read.
export function HomeSection({ home }: { home: HomeBooks }) {
  const ids = useDrawingIds();
  const names = home.rooms.map(({ room }) => room.name);
  const storeys = Math.max(1, Math.ceil(names.length / ROOMS_PER_STOREY));
  const top = G - storeys * STOREY * M;
  const ridge = top - ROOF * M;
  const books = booksIn(home);
  const found = figures(books);
  // Lit in the colour its lamp is in the places
  const roomIds = home.rooms.map(({ room }) => room.id);
  const decors = furnish(roomIds);
  const attic = atticOf(home.home.id, roomIds);
  const stack = stacked(books, M, G - ridge + M);
  const reach = inHome(stack.tall / M, names);
  const stackTop = G - stack.drawn;
  const first = Math.min(ridge, stackTop) - 24;
  const eaves = M * 0.55;
  const drop = (eaves * ROOF * M) / (WIDE / 2);

  return (
    <svg
      viewBox={`0 ${first} 500 ${G + UNDER - first}`}
      role='img'
      aria-label={`${home.home.name} in section, the books kept there stacked up beside it`}
      className='block w-full max-w-160 overflow-visible'
    >
      <SectionDefs ids={ids} />
      <RoomLamp
        id={ids.lamp('attic')}
        // Hanging from the middle of the ridge
        lamp={{ ...attic.lamp, at: 0.2 }}
        room={{ x: X, y: ridge + M * 0.4, width: WIDE, height: ROOF * M }}
        size={LAMP}
        light={reach.attic ? attic.lamp.light : undefined}
        outline={`M${X} ${top}L${X + WIDE / 2} ${ridge}L${X + WIDE} ${top}Z`}
      />
      {home.rooms.map(({ room, units }, i) => {
        const storey = Math.floor(i / ROOMS_PER_STOREY);
        const onStorey = Math.min(
          ROOMS_PER_STOREY,
          names.length - storey * ROOMS_PER_STOREY,
        );
        const width = WIDE / onStorey;
        const x = X + (i % ROOMS_PER_STOREY) * width;
        const floor = G - storey * STOREY * M;
        const ceiling = floor - STOREY * M;
        const on = reach.room === i;
        // As much of its name as its room has width for
        const name = room.name.slice(0, Math.round(width / 9));
        return (
          <g key={room.id}>
            <RoomLamp
              id={ids.lamp(i)}
              lamp={decors.get(room.id)!.lamp}
              room={{ x, y: ceiling + 3.5, width, height: STOREY * M - 3.5 }}
              // Past its number, and its name where that's written
              clear={x + 28 + name.length * 7.3 + 12}
              size={LAMP}
              light={on ? decors.get(room.id)!.lamp.light : undefined}
            />
            {units.slice(0, 2).map((unit, k) => (
              <Bookcase
                key={unit.unit.id}
                x={x + width * (0.1 + k * 0.32)}
                floor={floor}
                width={width * (k ? 0.18 : 0.26)}
                shelf={SHELF}
                shelves={shelvesOf(unit)}
              />
            ))}
            <circle
              cx={x + 14}
              cy={ceiling + 17}
              r='8'
              fill='none'
              stroke='var(--fine)'
              strokeWidth='0.7'
            />
            <text
              x={x + 14}
              y={ceiling + 20}
              textAnchor='middle'
              className='fill-ink text-[8.5px]'
            >
              {i + 1}
            </text>
            <text
              x={x + 28}
              y={ceiling + 20}
              className={`text-[8.5px] tracking-[0.18em] uppercase max-sm:hidden ${on ? 'fill-ink' : 'fill-muted'}`}
            >
              {name}
            </text>
            {i % ROOMS_PER_STOREY > 0 && (
              <rect
                x={x - 1.2}
                y={ceiling}
                width='2.4'
                height={STOREY * M}
                fill='var(--poche)'
              />
            )}
          </g>
        );
      })}
      <g fill='var(--poche)'>
        {Array.from({ length: storeys }, (_, f) => (
          <rect
            key={f}
            x={X - WALL}
            y={G - (f + 1) * STOREY * M - 3.5}
            width={WIDE + 2 * WALL}
            height='7'
          />
        ))}
        {[X - WALL, X + WIDE].map((x) => (
          <rect key={x} x={x} y={top} width={WALL} height={G - top} />
        ))}
      </g>
      <Windows storeys={storeys} seed={home.home.id} />
      <path
        d={`M${X - WALL - eaves} ${top + drop}L${X + WIDE / 2} ${ridge}L${X + WIDE + WALL + eaves} ${top + drop}`}
        fill='none'
        stroke='var(--poche)'
        strokeWidth={M * 0.18}
      />
      <Ground ids={ids} from={0} to={500} y={G} />
      <TitleBlock y={G + 34} width={500} metre={M} figures={stampOf(found)} />
      <BookStack books={books} x={SX} width={SW} ground={G} {...stack} />
      <line
        x1={
          reach.room !== undefined || reach.attic ? X + WIDE + WALL + 6 : SX - 6
        }
        x2={SX + SW + 14}
        y1={stackTop}
        y2={stackTop}
        stroke='var(--gold)'
        strokeDasharray='3 3'
      />
      <LevelMark
        x={SX + SW + 22}
        y={stackTop}
        value={`${(stack.tall / M).toFixed(2)} m`}
        gold
      />
    </svg>
  );
}

// A window in the outer walls of some storeys, picked by the home
function Windows({ storeys, seed }: { storeys: number; seed: string }) {
  return Array.from({ length: storeys }, (_, f) =>
    [X - WALL, X + WIDE].map((x, side) => {
      if (seedOf(`${seed}:${f}:${side}`) > 0.7) return null;
      const y = G - (f + 1) * STOREY * M + STOREY * M * 0.3;
      const tall = STOREY * M * 0.38;
      return <WallWindow key={`${f}${side}`} x={x} y={y} tall={tall} />;
    }),
  );
}
