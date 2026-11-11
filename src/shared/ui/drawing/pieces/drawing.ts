import type { ReactNode } from 'react';

// One thing a room can be furnished with, drawn in SVG: its viewBox, how
// wide it's drawn in the plan of a home (the room itself draws it larger),
// and the drawing
export type Drawing = {
  box: string;
  width: number;
  draw: () => ReactNode;
};

// Everything in a room is drawn in one fine line, as on an architect's
// section; only the books and the light have colour
export const fine = {
  fill: 'none',
  stroke: 'var(--fine)',
  strokeWidth: 0.8,
  strokeLinejoin: 'round',
  strokeLinecap: 'round',
} as const;
