import type { Home, PlaceRef } from './types';

export type PlaceLevel = 'home' | 'room' | 'unit' | 'shelf';

// What each level of a place is, as the reader is told
export const levelNames: Record<PlaceLevel, string> = {
  home: 'Home',
  room: 'Room',
  unit: 'Bookcase',
  shelf: 'Shelf',
};

// The way down to a book's place, home first: home, room, bookcase and
// shelf with their names. As far down as the tree still has them.
export function placePath(homes: Home[], place: PlaceRef) {
  const home = homes.find((h) => h.id === place.home);
  const room = home?.rooms.find((r) => r.id === place.room);
  const unit = room?.units.find((u) => u.id === place.unit);
  const shelf = unit?.shelves.find((s) => s.id === place.shelf);
  const steps: [PlaceLevel, { name: string } | undefined][] = [
    ['home', home],
    ['room', room],
    ['unit', unit],
    ['shelf', shelf],
  ];
  return steps.flatMap(([level, node]) =>
    node ? [{ level, name: node.name }] : [],
  );
}
