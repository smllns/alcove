import { ObjectId } from 'mongodb';
import { books, places, type HomeNode, type PlaceRef } from '../db.js';
import type { PlacesInput } from './schemas.js';

export const getPlaces = async (userId: ObjectId) =>
  (await places().findOne({ _id: userId }))?.homes ?? [];

export const deletePlaces = (userId: ObjectId) =>
  places().deleteOne({ _id: userId });

// Every id in a tree, homes down to shelves
const idsOf = (homes: HomeNode[]) =>
  homes.flatMap((h) => [
    h.id,
    ...h.rooms.flatMap((r) => [
      r.id,
      ...r.units.flatMap((u) => [u.id, ...u.shelves.map((s) => s.id)]),
    ]),
  ]);

// Saves the tree as the reader arranged it. Places they removed take their
// books' place with them, one level at a time: a book on a removed shelf
// stays in its bookcase, one in a removed home no longer has a place.
// Returns the saved tree and the real ids given to new places, keyed by the
// temporary ids they came with.
export async function savePlaces(userId: ObjectId, input: PlacesInput) {
  const before = new Set(idsOf(await getPlaces(userId)));
  const used = new Set<string>();
  const created: Record<string, string> = {};
  const keep = (id: string | undefined) => {
    if (id && before.has(id) && !used.has(id)) {
      used.add(id);
      return id;
    }
    const fresh = new ObjectId().toHexString();
    if (id) created[id] = fresh;
    return fresh;
  };

  const homes: HomeNode[] = input.homes.map((h) => ({
    id: keep(h.id),
    name: h.name,
    rooms: h.rooms.map((r) => ({
      id: keep(r.id),
      name: r.name,
      units: r.units.map((u) => ({
        id: keep(u.id),
        name: u.name,
        shelves: u.shelves.map((s) => ({ id: keep(s.id), name: s.name })),
      })),
    })),
  }));

  const gone = [...before].filter((id) => !used.has(id));
  if (gone.length) await unplaceBooks(userId, gone);

  await places().updateOne(
    { _id: userId },
    { $set: { homes, updatedAt: new Date() } },
    { upsert: true },
  );
  return { homes, created };
}

async function unplaceBooks(userId: ObjectId, gone: string[]) {
  const where = (level: keyof PlaceRef) => ({
    userId,
    [`copy.place.${level}`]: { $in: gone },
  });
  await books().updateMany(where('home'), { $unset: { 'copy.place': '' } });
  await books().updateMany(where('room'), {
    $unset: {
      'copy.place.room': '',
      'copy.place.unit': '',
      'copy.place.shelf': '',
    },
  });
  await books().updateMany(where('unit'), {
    $unset: { 'copy.place.unit': '', 'copy.place.shelf': '' },
  });
  await books().updateMany(where('shelf'), {
    $unset: { 'copy.place.shelf': '' },
  });
}

// How many books are in each place, counting a book in every level it's in
// (one on a shelf counts for the shelf, its bookcase, room and home)
export async function countByPlace(userId: ObjectId) {
  const rows = await books()
    .aggregate<{ _id: string; count: number }>([
      { $match: { userId, 'copy.place.home': { $exists: true } } },
      {
        $project: {
          ids: [
            '$copy.place.home',
            '$copy.place.room',
            '$copy.place.unit',
            '$copy.place.shelf',
          ],
        },
      },
      { $unwind: '$ids' },
      { $match: { ids: { $type: 'string' } } },
      { $group: { _id: '$ids', count: { $sum: 1 } } },
    ])
    .toArray();
  return Object.fromEntries(rows.map((row) => [row._id, row.count]));
}

// The part of `ref` that exists in the reader's tree, from the home down;
// nothing if even the home is gone
export function resolvePlace(
  homes: HomeNode[],
  ref: PlaceRef,
): PlaceRef | undefined {
  const home = homes.find((h) => h.id === ref.home);
  if (!home) return undefined;
  const room = home.rooms.find((r) => r.id === ref.room);
  if (!room) return { home: home.id };
  const unit = room.units.find((u) => u.id === ref.unit);
  if (!unit) return { home: home.id, room: room.id };
  const shelf = unit.shelves.find((s) => s.id === ref.shelf);
  return {
    home: home.id,
    room: room.id,
    unit: unit.id,
    ...(shelf && { shelf: shelf.id }),
  };
}
