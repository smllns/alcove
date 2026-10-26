import type { Book } from '@/entities/book/types';
import type { Home, Room, Shelf, Unit } from '@/entities/place/types';

// The reader's books put where they're kept, place by place. A book kept
// only as far as a bookcase (not a shelf of it), a room or a home is
// `loose` there, lying in a pile rather than standing on a shelf.

type ShelfBooks = { shelf: Shelf; books: Book[] };
export type UnitBooks = {
  unit: Unit;
  shelves: ShelfBooks[];
  loose: Book[];
  count: number;
};
export type RoomBooks = {
  room: Room;
  units: UnitBooks[];
  loose: Book[];
  count: number;
};
export type HomeBooks = {
  home: Home;
  rooms: RoomBooks[];
  loose: Book[];
  count: number;
};

const sum = (each: { count: number }[]) =>
  each.reduce((total, one) => total + one.count, 0);

export function arrange(homes: Home[], books: Book[]) {
  // Books by the deepest place they're in; a place since removed is left
  // for the one above it
  const at = new Map<string, Book[]>();
  const known = new Set(
    homes.flatMap((home) => [
      home.id,
      ...home.rooms.flatMap((room) => [
        room.id,
        ...room.units.flatMap((unit) => [
          unit.id,
          ...unit.shelves.map((shelf) => shelf.id),
        ]),
      ]),
    ]),
  );
  const unplaced: Book[] = [];
  for (const book of books) {
    const place = book.copy?.place;
    const deepest = [place?.shelf, place?.unit, place?.room, place?.home].find(
      (id) => id && known.has(id),
    );
    if (deepest) at.set(deepest, [...(at.get(deepest) ?? []), book]);
    else unplaced.push(book);
  }
  const booksAt = (id: string) => at.get(id) ?? [];

  const arranged: HomeBooks[] = homes.map((home) => {
    const rooms = home.rooms.map((room) => {
      const units = room.units.map((unit) => {
        const shelves = unit.shelves.map((shelf) => ({
          shelf,
          books: booksAt(shelf.id),
        }));
        const loose = booksAt(unit.id);
        const count =
          loose.length + shelves.reduce((n, s) => n + s.books.length, 0);
        return { unit, shelves, loose, count };
      });
      const loose = booksAt(room.id);
      return { room, units, loose, count: loose.length + sum(units) };
    });
    const loose = booksAt(home.id);
    return { home, rooms, loose, count: loose.length + sum(rooms) };
  });
  return { homes: arranged, unplaced };
}
