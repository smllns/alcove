import type { Book } from '@/entities/book/types';
import { seedOf } from '@/shared/lib/seed';
import type { Decor } from '@/shared/ui/drawing/decor';
import { FLAT, M, SHELF } from './blockMeasures';
import { Bookcase } from './BookShapes';
import { hangingLamp, type Ids } from './drawingKit';
import { RoomLamp } from './RoomLamp';
import { STOREY } from './measured';

// Kept clear between things, and at the walls
const GAP = 4;
const LAMP = M / 30;
// Put up on the wall, a little over halfway up it
const WALL_AT = STOREY * M * 0.45;

type Along = { wall: boolean; width: number; shelves: number };

// One flat of the block of flats, kept its own way by `n`: empty now and
// then; otherwise one, two or three bookcases of the reader's books
// (`books`), each of its own width and height, and sometimes shelves put
// up on the wall over the floor left bare, the lot set along the floor at
// a place of its own. Its lamp (as the places furnish a room, `decor`),
// if it has one, hangs where nothing's under it to touch; with no such
// place, it has none. Lit or not, as the block has it.
export function BlockFlat({
  ids,
  n,
  x,
  floor,
  decor,
  books,
  lit,
}: {
  ids: Ids;
  n: number;
  x: number;
  floor: number;
  decor: Decor;
  books: (shelf: number) => Book[];
  lit: boolean;
}) {
  const seed = (what: string) => seedOf(`flat:${n}:${what}`);
  const ceiling = floor - STOREY * M;
  const empty = seed('empty') < 0.15;
  const many = seed('cases');
  const along: Along[] = empty
    ? []
    : Array.from({ length: many < 0.45 ? 1 : many < 0.85 ? 2 : 3 }, (_, k) => ({
        wall: false,
        width: FLAT * (0.14 + seed(`wide${k}`) * 0.12),
        shelves: 3 + Math.floor(seed(`tall${k}`) * 3),
      }));
  const shelves = {
    wall: true,
    width: FLAT * (0.18 + seed('wallWide') * 0.08),
    shelves: seed('wallTwo') < 0.4 ? 2 : 1,
  };
  const room = (all: Along[]) =>
    all.reduce((sum, one) => sum + one.width + GAP, GAP);
  if (!empty && seed('wall') < 0.55 && room([...along, shelves]) <= FLAT)
    along.splice(Math.floor(seed('wallAt') * (along.length + 1)), 0, shelves);

  // Where each stands, and how high it reaches
  let left = x + GAP + seed('start') * (FLAT - room(along));
  const placed = along.map((one) => {
    const at = left;
    left += one.width + GAP;
    const foot = one.wall ? floor - WALL_AT : floor;
    return { ...one, left: at, foot, top: foot - one.shelves * SHELF - 2 };
  });

  // The lamp, where it hangs clear of everything (or nowhere)
  const lamp = hangingLamp(decor.lamp, ids.lamp(n), LAMP);
  const bottom = ceiling + 3.5 + lamp.cord + lamp.tall + GAP;
  const clearAt = (cx: number) =>
    placed.every(
      (one) =>
        one.top > bottom ||
        cx + lamp.wide / 2 + GAP < one.left ||
        cx - lamp.wide / 2 - GAP > one.left + one.width,
    );
  const wanted = x + FLAT * (0.2 + decor.lamp.at * 0.6);
  const spots = Array.from(
    { length: Math.floor(FLAT - lamp.wide - 2 * GAP) },
    (_, i) => x + GAP + lamp.wide / 2 + i,
  ).filter(clearAt);
  const hung = lit || seed('lamp') > 0.25;
  const at =
    hung && spots.length
      ? spots.reduce((a, b) =>
          Math.abs(b - wanted) < Math.abs(a - wanted) ? b : a,
        )
      : null;

  return (
    <g>
      {(at !== null || lit) && (
        <RoomLamp
          id={ids.lamp(n)}
          lamp={decor.lamp}
          room={{ x, y: ceiling + 3.5, width: FLAT, height: STOREY * M - 3.5 }}
          size={LAMP}
          at={at}
          light={lit ? decor.lamp.light : undefined}
        />
      )}
      {placed.map((one, k) => (
        <Bookcase
          key={k}
          x={one.left}
          floor={one.foot}
          width={one.width}
          shelf={SHELF}
          shelves={Array.from({ length: one.shelves }, (_, s) =>
            books(k * 5 + s),
          )}
          bare={one.wall}
        />
      ))}
    </g>
  );
}
