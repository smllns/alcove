import { authorKey } from '@/entities/book/authors';
import type { Book } from '@/entities/book/types';
import { linksBetween, type Link, type Point } from './constellations';
import { createPacker, type Box } from './packing';

// The sky is a round galaxy: a dense core of the first books, thinning out
// towards the edge. Books are placed one by one, oldest first, each in the
// first free spot along a spiral out from the middle, so a new book never
// moves the ones already there: it fills a gap or joins the edge. Every
// cover keeps clear of the others, with sky between them however they're
// tilted or wander. A scatter, a tilt and a drift per book, all derived
// from its id, keep it loose and the same on every visit. A writer's books
// go wherever their turn puts them, like any others, and lines join them,
// however far apart, into a constellation (constellations.ts).

// The golden angle: consecutive spots land as far apart as they can
const GOLDEN = Math.PI * (3 - Math.sqrt(5));
// Spots along the spiral start this close (in sky pixels), much closer
// than a cover is wide, so there's always one near where a book should go
const SLOT = 34;
// Spots spread out faster than an even disc would (which is 0.5), so the
// galaxy has a dense core and a looser rim
const SPREAD = 0.6;
// How far a cover reaches from its middle, as a share of its width, tilted
// as far as a tilt goes (its half width is 0.5, its half height 0.75)
const REACH_W = 0.62;
const REACH_H = 0.83;
// The sky kept between two covers (sky pixels): enough that two wandering
// towards each other never touch, and some more of its own for each book,
// up to SPARE, which keeps the whole from looking like a grid
const GAP = 28;
const SPARE = 16;
// How far a book may land from its spot, as a share of the spacing there
const SCATTER = 0.9;
// How many spots back from the furthest one used each search begins
const SEARCH_BACK = 240;

// A cover's width by rating: the best loved are the brightest stars
const starWidth = (rating?: number) => (rating ? 46 + rating * 22 : 68);

export type SkyStar = {
  book: Book;
  // Centre, in sky pixels
  x: number;
  y: number;
  width: number;
  tilt: number;
  // Slow wandering in a small loop about its place, swaying as it goes
  driftX: number;
  driftY: number;
  driftSeconds: number;
  sway: number;
  // How far into its wandering and twinkling it starts (a negative delay),
  // so the stars don't all move together
  phase: number;
  // Its writer, when there's more than one of their books in the sky
  group?: string;
};

export type Bounds = { minX: number; minY: number; maxX: number; maxY: number };

// Numbers in [0, 1) that are always the same for the same id
function seeded(id: string) {
  let seed = 0;
  for (const char of id) seed = (Math.imul(seed, 31) + char.charCodeAt(0)) | 0;
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// The first free spot along the spiral from `startSlot`, for a cover kept
// clear by `halfW` × `halfH` and nudged by `scatter` (each -0.5 to 0.5)
function findSpot(
  packer: ReturnType<typeof createPacker>,
  cover: { halfW: number; halfH: number; scatter: [number, number] },
  startSlot: number,
) {
  const { halfW, halfH, scatter } = cover;
  for (let slot = startSlot; ; slot++) {
    const radius = SLOT * slot ** SPREAD;
    const angle = slot * GOLDEN;
    // The spacing around this spot, which the nudge scales with
    const room = SLOT * Math.max(1, slot ** (SPREAD - 0.5)) * SCATTER;
    const box: Box = {
      x: Math.cos(angle) * radius + scatter[0] * room,
      y: Math.sin(angle) * radius + scatter[1] * room,
      halfW,
      halfH,
    };
    if (packer.fits(box)) return { box, slot };
  }
}

// The part of the sky the given stars take up
export const boundsOf = (stars: SkyStar[]) =>
  stars.reduce<Bounds>(
    (b, s) => {
      const halfW = s.width / 2;
      const halfH = s.width * 0.75;
      return {
        minX: Math.min(b.minX, s.x - halfW),
        minY: Math.min(b.minY, s.y - halfH),
        maxX: Math.max(b.maxX, s.x + halfW),
        maxY: Math.max(b.maxY, s.y + halfH),
      };
    },
    { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity },
  );

export function layoutSky(books: Book[]) {
  // Oldest first: the order a book was added never changes
  const ordered = [...books].sort((a, b) =>
    a.createdAt.localeCompare(b.createdAt),
  );

  const packer = createPacker();
  // Spots near the middle fill up early, so each search starts a little
  // short of the furthest spot used so far rather than at the very centre;
  // that keeps thousands of books quick to lay out
  let lastSlot = 0;
  // Where each writer's books are, so far
  const byWriter = new Map<string, Point[]>();

  const stars: SkyStar[] = ordered.map((book) => {
    const random = seeded(book.id);
    const width = starWidth(book.copy?.rating);
    // Half the sky kept between it and a neighbour, on each side
    const clear = (GAP + random() * SPARE) / 2;
    const scatter: [number, number] = [random() - 0.5, random() - 0.5];
    const { box, slot } = findSpot(
      packer,
      {
        halfW: width * REACH_W + clear,
        halfH: width * REACH_H + clear,
        scatter,
      },
      Math.max(0, lastSlot - SEARCH_BACK),
    );
    lastSlot = Math.max(lastSlot, slot);
    packer.add(box);
    const writer = authorKey(book.authors);
    if (writer) {
      const theirs = byWriter.get(writer);
      if (theirs) theirs.push(box);
      else byWriter.set(writer, [box]);
    }

    return {
      book,
      x: box.x,
      y: box.y,
      width,
      tilt: (random() - 0.5) * 20,
      driftX: (random() - 0.5) * 24,
      driftY: (random() - 0.5) * 24,
      driftSeconds: 6 + random() * 6,
      sway: (random() - 0.5) * 4,
      phase: random() * -12,
      group: writer || undefined,
    };
  });

  // Which writers have more than one book here is known once all are in:
  // theirs are joined up; a writer with only the one is no group at all
  const links: Link[] = [];
  for (const [writer, points] of byWriter)
    if (points.length > 1) links.push(...linksBetween(writer, points));
  for (const star of stars)
    if (star.group && byWriter.get(star.group)!.length < 2)
      star.group = undefined;

  const bounds = stars.length
    ? boundsOf(stars)
    : { minX: 0, minY: 0, maxX: 0, maxY: 0 };

  // Smaller stars first, so the bigger ones are drawn in front of them
  stars.sort((a, b) => a.width - b.width);
  const typicalWidth = stars[Math.floor(stars.length / 2)]?.width ?? 0;
  return { stars, bounds, typicalWidth, links };
}
