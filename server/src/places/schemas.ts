import { z } from 'zod';
import { maybe } from '../lib/validation.js';

const name = (what: string) =>
  z
    .string()
    .trim()
    .min(1, `Give this ${what} a name.`)
    .max(60, 'Keep it under 60 characters.');

// Existing places keep their id; new ones come without (or with a temporary
// one from the browser) and get a real one on saving
const id = z.string().max(40).optional();

const list = <T extends z.ZodType>(item: T, max: number, what: string) =>
  z
    .array(item)
    .max(max, `That’s a lot of ${what}. Keep it to ${max}.`)
    .default([]);

const shelf = z.object({ id, name: name('shelf') });
const unit = z.object({
  id,
  name: name('bookcase'),
  shelves: list(shelf, 30, 'shelves'),
});
const room = z.object({
  id,
  name: name('room'),
  units: list(unit, 50, 'bookcases'),
});
const home = z.object({
  id,
  name: name('home'),
  rooms: list(room, 50, 'rooms'),
});

// The whole tree, as the reader last arranged it
export const placesSchema = z.object({ homes: list(home, 20, 'homes') });
export type PlacesInput = z.infer<typeof placesSchema>;

// Where one book is; only the home is required
const ref = z.string().max(40);
export const placeRefSchema = z.object({
  home: ref,
  room: maybe(ref),
  unit: maybe(ref),
  shelf: maybe(ref),
});
