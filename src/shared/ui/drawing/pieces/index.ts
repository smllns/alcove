import type { Drawing } from './drawing';
import { floorLamps, pendants } from './lamps';
import { pictures } from './pictures';
import { plants } from './plants';
import { seats } from './seats';

// Everything a room can be furnished with, by kind, each kind in a look
// or two (pieces/*)
export const families = {
  picture: pictures,
  pendant: pendants,
  floorLamp: floorLamps,
  plant: plants,
  seat: seats,
} satisfies Record<string, Record<string, Drawing>>;

export type Family = keyof typeof families;
