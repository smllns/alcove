import type { ObjectId } from 'mongodb';
import { books, type BookListNode } from '../db.js';

// How many books are in each list, by id: those on the shelves in it, and
// those from the catalogue in it, but not twice over for a work there is
// a copy of in it too
export async function countByList(userId: ObjectId, all: BookListNode[]) {
  const counts = await countsByOwner([{ userId, lists: all }]);
  return counts.get(userId.toHexString()) ?? {};
}

// The same for several readers' lists at once, in one look: by reader
// (their id), then by list
export async function countsByOwner(
  owned: { userId: ObjectId; lists: BookListNode[] }[],
) {
  const rows = await books()
    .aggregate<{
      _id: { user: ObjectId; list: string };
      count: number;
      works: string[];
    }>([
      {
        $match: {
          userId: { $in: owned.map((each) => each.userId) },
          lists: { $exists: true, $ne: [] },
        },
      },
      { $unwind: '$lists' },
      {
        $group: {
          _id: { user: '$userId', list: '$lists' },
          count: { $sum: 1 },
          works: { $addToSet: '$openLibrary.work' },
        },
      },
    ])
    .toArray();
  const shelved = new Map(
    rows.map((row) => [`${row._id.user.toHexString()}:${row._id.list}`, row]),
  );
  return new Map(
    owned.map(({ userId, lists: all }) => [
      userId.toHexString(),
      countsOf(all, (id) => shelved.get(`${userId.toHexString()}:${id}`)),
    ]),
  );
}

// How many books each list holds: those on the shelves in it (`shelvedIn`)
// and those from the catalogue in it that aren't among them
function countsOf(
  all: BookListNode[],
  shelvedIn: (id: string) => { count: number; works: string[] } | undefined,
) {
  return Object.fromEntries(
    all.map((list) => {
      const row = shelvedIn(list.id);
      const copies = new Set(row?.works);
      const works = (list.works ?? []).filter(
        (work) => !copies.has(work.workKey),
      );
      return [list.id, (row?.count ?? 0) + works.length];
    }),
  );
}
