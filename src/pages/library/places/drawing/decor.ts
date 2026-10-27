import { seedOf } from '@/shared/lib/seed';
import { families, type Family } from './pieces';

// What's in a room besides its books, picked by the room itself, so each
// room is furnished its own way and stays so. Always a lamp, hanging
// somewhere along the ceiling at a length of its own, or standing at one
// end of the floor, its light a colour of its own. Then perhaps a picture
// on the wall, and a seat or a plant or two on the floor.

export type Thing = { family: Family; look: string };
export type Decor = {
  lamp: Thing & {
    hanging: boolean;
    // How far down it hangs, from 0 (close to the ceiling) to 1
    drop: number;
    // Where along the ceiling, as a share of the room left between the
    // room's name and what's on its wall
    at: number;
    // Standing, at the near end of the floor rather than the far one
    first: boolean;
    // The colour of its light (styles/places.css)
    light: Light;
  };
  // From the left, side by side towards the right wall
  wall: Thing[];
  // `first`: before the bookcases rather than after them
  floor: (Thing & { first: boolean })[];
};

// Lamplight: warm, or now and then coloured, as a neon lamp is
type Light = 'warm' | 'rose' | 'mint' | 'lavender' | 'sky';
const lights: Light[] = ['warm', 'warm', 'rose', 'mint', 'lavender', 'sky'];

// How many, given a seed: none below the first share, one below the
// second, otherwise two
const howMany = (seed: number, [none, one]: [number, number]) =>
  seed < none ? 0 : seed < one ? 1 : 2;

// The first along from `start` (round the list) not in `taken`, or the
// one at `start` when they all are
function firstFree<T>(all: T[], start: number, taken: Set<T>) {
  return (
    all
      .map((_, i) => all[(start + i) % all.length])
      .find((each) => !taken.has(each)) ?? all[start]
  );
}

// Kinds no two rooms side by side have the same look of, nor one room
// twice
const varied: Family[] = ['picture', 'pendant', 'floorLamp', 'seat', 'plant'];
const lookOf = (thing: Thing) => `${thing.family}:${thing.look}`;

// `near`: the rooms beside it, already furnished, whose pictures, plants,
// lamps and light it picks others than
function decorOf(room: string, near: Decor[] = []): Decor {
  const seed = (what: string) => seedOf(`${room}:${what}`);
  const taken = new Set(
    near
      .flatMap((decor) => [decor.lamp, ...decor.wall, ...decor.floor])
      .filter((thing) => varied.includes(thing.family))
      .map(lookOf),
  );
  const thing = (family: Family, what: string): Thing => {
    const looks = Object.keys(families[family]).map(
      (look) => `${family}:${look}`,
    );
    const start = Math.floor(seed(`${what}:look`) * looks.length);
    const look = varied.includes(family)
      ? firstFree(looks, start, taken)
      : looks[start];
    taken.add(look);
    return { family, look: look.slice(family.length + 1) };
  };

  const hanging = seed('lamp') < 0.65;
  const lamp = {
    ...thing(hanging ? 'pendant' : 'floorLamp', 'lamp'),
    hanging,
    drop: seed('drop'),
    at: 0.1 + 0.8 * seed('lampAt'),
    first: seed('lampEnd') < 0.5,
    light: firstFree(
      lights,
      Math.floor(seed('light') * lights.length),
      new Set(near.map((decor) => decor.lamp.light)),
    ),
  };

  const wall = seed('picture') < 0.6 ? [thing('picture', 'wall')] : [];

  // A seat or a plant, or one of each: two seats would crowd it, and two
  // plants would be the same plant
  const first: Family = seed('floor0') < 0.45 ? 'seat' : 'plant';
  const floor = Array.from(
    { length: howMany(seed('floors'), [0.25, 0.75]) },
    (_, i) => ({
      ...thing(i ? (first === 'seat' ? 'plant' : 'seat') : first, `floor${i}`),
      first: seed(`floor${i}:end`) < 0.35,
    }),
  );
  return { lamp, wall, floor };
}

// How many rooms back count as beside one: the rooms next to it on its
// floor, and the one over it, however many to a floor
const NEAR = 3;

// Every room of a home furnished, in order, each unlike those beside it
export function furnish(rooms: string[]) {
  const decors: Decor[] = [];
  for (const [i, room] of rooms.entries())
    decors.push(decorOf(room, decors.slice(Math.max(0, i - NEAR), i)));
  return new Map(rooms.map((room, i) => [room, decors[i]]));
}

// A home's attic, furnished as a room is, by the home itself: only its
// lamp, hanging from the middle of the ridge, its light a colour unlike
// that of the rooms on the top storey under it (the first few, however
// many to a storey). In the drawing of the home and opened alike.
export function atticOf(home: string, rooms: string[]): Decor {
  const seed = (what: string) => seedOf(`${home}:attic:${what}`);
  const looks = Object.keys(families.pendant);
  const below = [...furnish(rooms.slice(0, NEAR)).values()];
  return {
    lamp: {
      family: 'pendant',
      look: looks[Math.floor(seed('lamp') * looks.length)],
      hanging: true,
      drop: 0.3,
      at: 0.5,
      first: false,
      light: firstFree(
        lights,
        Math.floor(seed('light') * lights.length),
        new Set(below.map((decor) => decor.lamp.light)),
      ),
    },
    wall: [],
    floor: [],
  };
}
