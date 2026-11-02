import { seedOf } from '@/shared/lib/seed';
import type { Decor } from '../places/drawing/decor';
import { pendants } from '../places/drawing/pieces/lamps';
import { useId } from 'react';

// The pattern and the lights a drawing fills with, named its own way so
// two drawings never share them
export function useDrawingIds() {
  const id = useId().replace(/:/g, '');
  return { hatch: `${id}h`, lamp: (key: string | number) => `${id}${key}` };
}
export type Ids = ReturnType<typeof useDrawingIds>;

// The outline of a room, for its light to fill
export const roomOutline = (x: number, y: number, w: number, h: number) =>
  `M${x} ${y}h${w}v${h}h${-w}Z`;

// How much room a drawing keeps under its ground for its title block
export const UNDER = 84;

// How thick an outer wall is drawn
export const WALL = 6;

const looks = Object.keys(pendants) as (keyof typeof pendants)[];

// A room's lamp as the stats hang it, `size` times as large as in the plan
// of a home: the places' own lamp, or (where the places stand one on the
// floor) one of their hanging ones, picked by `id`; how wide and tall it's
// drawn, and how far its cord lets it down from the ceiling
export function hangingLamp(lamp: Decor['lamp'], id: string, size: number) {
  const drawing =
    pendants[
      lamp.hanging
        ? (lamp.look as keyof typeof pendants)
        : looks[Math.floor(seedOf(id) * looks.length)]
    ];
  const [, , boxWide, boxTall] = drawing.box.split(' ').map(Number);
  const wide = drawing.width * size;
  return {
    drawing,
    wide,
    tall: (wide * boxTall) / boxWide,
    cord: (4 + (lamp.hanging ? lamp.drop : 0.4) * 24) * 1.1 * size,
  };
}
