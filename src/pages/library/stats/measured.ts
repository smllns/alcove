// What a stack of books so tall comes up to: in a block of flats (all the
// books together) or in one of the reader's homes, its rooms two to a
// storey as the places draw them on a phone. In metres.

export const STOREY = 3;
// The pitched roof of a home over its top storey; the parapet of a block
export const ROOF = 2.2;
export const PARAPET = 0.9;
export const BLOCK_STOREYS = 6;
export const ROOMS_PER_STOREY = 2;

const ORDINALS = ['ground', 'first', 'second', 'third', 'fourth', 'fifth'];
export const ordinal = (storey: number) => ORDINALS[storey] ?? `${storey}th`;

// Short of a storey, what the stack comes up to beside the reader
function low(height: number) {
  if (height < 0.12) return 'about as tall as a mug';
  if (height < 0.32) return 'about as tall as a wine bottle';
  if (height < 0.55) return 'about knee‑high';
  if (height < 1.1) return 'about waist‑high';
  if (height < 1.5) return 'up to your shoulders';
  return height < 1.95 ? 'about as tall as you' : 'taller than you';
}

const times = (k: number) => (k === 2 ? 'twice' : `${k} times`);

// The storey of the block the stack reaches (past its roof, none), and
// saying so
export function inBlock(height: number) {
  const storey = Math.floor(height / STOREY);
  const block = BLOCK_STOREYS * STOREY + PARAPET;
  if (storey >= BLOCK_STOREYS) {
    const k = Math.round(height / block);
    return {
      storey: null,
      words:
        k < 2
          ? 'past the roof of a six‑storey block of flats'
          : `${times(k)} the height of a six‑storey block of flats`,
    };
  }
  return {
    storey,
    words: storey
      ? `up to the ${ordinal(storey)} floor of a block of flats`
      : low(height),
  };
}

// Where in a home with `rooms` the stack reaches: a room (by its place
// among them, the one nearest the stack on its storey), the attic under
// the roof, or past it
export function inHome(height: number, rooms: string[]) {
  const storeys = Math.max(1, Math.ceil(rooms.length / ROOMS_PER_STOREY));
  const storey = Math.floor(height / STOREY);
  if (storey < storeys && rooms.length) {
    const room = Math.min(
      rooms.length - 1,
      storey * ROOMS_PER_STOREY + ROOMS_PER_STOREY - 1,
    );
    return { room, words: `up into the ${rooms[room].toLowerCase()}` };
  }
  if (height < storeys * STOREY + ROOF)
    return { attic: true, words: 'up under its roof' };
  const k = Math.round(height / (storeys * STOREY + ROOF));
  return { words: k < 2 ? 'past its roof' : `${times(k)} as high as it` };
}
