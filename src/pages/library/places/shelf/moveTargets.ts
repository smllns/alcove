import type { Home, PlaceRef } from '@/entities/place/types';

// Somewhere books can be moved to: its name in the list, and how it's told
// once they're there
export type Target = {
  key: string;
  name: string;
  where: string;
  // None: out of every place
  place?: PlaceRef;
};
type Unit = { id: string; name: string; target?: Target; shelves: Target[] };
type Room = { id: string; name: string; target?: Target; units: Unit[] };

// The same place, however it's written
export const placeKey = (place?: PlaceRef) =>
  place
    ? [place.home, place.room, place.unit, place.shelf].join('/')
    : 'nowhere';

// Out of every place, among the books not placed yet
export const nowhere: Target = {
  key: placeKey(undefined),
  name: 'Not placed yet',
  where: 'Not placed yet',
};

const target = (place: PlaceRef, name: string, where: string): Target => ({
  key: placeKey(place),
  name,
  where,
  place,
});

// Every place in every home books can go, as the tree it's in: a home's
// attic (not sorted into a room), each room, each bookcase in it, and
// each shelf of each bookcase, as broad or as exact as the reader likes.
// Only what matches `asked`, by its own name or any it's in, with what
// it's in.
export function targetsOf(homes: Home[], asked: string) {
  const has = (...names: string[]) =>
    !asked || names.join(' ').toLowerCase().includes(asked);
  return homes
    .map((home) => {
      const attic = has(home.name, 'not sorted attic')
        ? target({ home: home.id }, 'Not sorted', `${home.name} · Not sorted`)
        : undefined;
      const rooms = home.rooms
        .map((room): Room => {
          const at = { home: home.id, room: room.id };
          const units = room.units
            .map((unit): Unit => {
              const here = { ...at, unit: unit.id };
              return {
                id: unit.id,
                name: unit.name,
                target: has(home.name, room.name, unit.name)
                  ? target(here, unit.name, `${room.name} · ${unit.name}`)
                  : undefined,
                shelves: unit.shelves
                  .filter((shelf) =>
                    has(home.name, room.name, unit.name, shelf.name),
                  )
                  .map((shelf) =>
                    target(
                      { ...here, shelf: shelf.id },
                      shelf.name,
                      `${room.name} · ${shelf.name}`,
                    ),
                  ),
              };
            })
            .filter((unit) => unit.target || unit.shelves.length);
          return {
            id: room.id,
            name: room.name,
            target: has(home.name, room.name)
              ? target(at, room.name, room.name)
              : undefined,
            units,
          };
        })
        .filter((room) => room.target || room.units.length);
      return { id: home.id, home: home.name, attic, rooms };
    })
    .filter((group) => group.attic || group.rooms.length);
}
