import { ObjectId } from 'mongodb';
import { books, lists, type BookListNode, type ListedWorkNode } from '../db.js';
import { sameButCase } from '../lib/text.js';

// Most a reader can have, and most books from the catalogue in one; far
// more than anyone keeps
const MAX_LISTS = 200;
const MAX_WORKS = 1000;

// The list every reader has from the start, first of all, of books
// they'd like to read next: their own not read yet, and the catalogue's
// they don't have. It can't be renamed or removed, only emptied.
export const WANT_LIST = 'want-to-read';
const wantList: BookListNode = {
  id: WANT_LIST,
  name: 'Want to read',
  description:
    'Every book you’d like to read, those on your shelves and those you don’t have yet. A book leaves once you start it.',
  public: false,
};

// The reader's lists, Want to read first; put in place the first time
// they're asked for (two asking at once, only one of them puts it there)
export async function getLists(userId: ObjectId) {
  const found = (await lists().findOne({ _id: userId }))?.lists ?? [];
  if (found.some((list) => list.id === WANT_LIST)) return found;
  try {
    await lists().updateOne(
      { _id: userId, 'lists.id': { $ne: WANT_LIST } },
      {
        $push: { lists: { $each: [wantList], $position: 0 } },
        $set: { updatedAt: new Date() },
      },
      { upsert: true },
    );
  } catch (error) {
    // Put there meanwhile by the other
    if ((error as { code?: number }).code !== 11000) throw error;
  }
  return [wantList, ...found];
}

export const deleteLists = (userId: ObjectId) =>
  lists().deleteOne({ _id: userId });

// A new list, at the end, public if `open`, with what's said about it, if
// anything. One by that name already is the one meant.
export async function createList(
  userId: ObjectId,
  name: string,
  open: boolean,
  description?: string,
) {
  const all = await getLists(userId);
  const known = all.find((list) => sameButCase(list.name, name));
  if (known) return known;
  if (all.length >= MAX_LISTS) return null;
  const list: BookListNode = {
    id: new ObjectId().toHexString(),
    name,
    ...(description && { description }),
    public: open,
  };
  await lists().updateOne(
    { _id: userId },
    { $push: { lists: list }, $set: { updatedAt: new Date() } },
    { upsert: true },
  );
  return list;
}

// Renamed, unless another list has that name already ('taken'), made
// public or private, and said something else of (or nothing, emptied)
export async function changeList(
  userId: ObjectId,
  id: string,
  change: { name?: string; public?: boolean; description?: string },
) {
  const all = await getLists(userId);
  if (!all.some((list) => list.id === id)) return 'missing';
  const { name, description } = change;
  if (
    name !== undefined &&
    all.some((list) => list.id !== id && sameButCase(list.name, name))
  )
    return 'taken';
  await lists().updateOne(
    { _id: userId, 'lists.id': id },
    {
      $set: {
        ...(name !== undefined && { 'lists.$.name': name }),
        ...(change.public !== undefined && {
          'lists.$.public': change.public,
        }),
        ...(description && { 'lists.$.description': description }),
        updatedAt: new Date(),
      },
      ...(description === '' && { $unset: { 'lists.$.description': '' } }),
    },
  );
  return 'changed';
}

// The list goes, and its books stay where they are, only out of it
export async function deleteList(userId: ObjectId, id: string) {
  const { modifiedCount } = await lists().updateOne(
    { _id: userId, 'lists.id': id },
    { $pull: { lists: { id } }, $set: { updatedAt: new Date() } },
  );
  if (modifiedCount)
    await books().updateMany({ userId, lists: id }, { $pull: { lists: id } });
  return modifiedCount > 0;
}

// Books from the catalogue put in a list (at its end; one in it already
// goes to the end) and taken out of it: 'missing' when there's no such
// list, 'full' when there'd be too many
export async function changeListWorks(
  userId: ObjectId,
  id: string,
  add: ListedWorkNode[],
  remove: string[],
) {
  const list = (await getLists(userId)).find((each) => each.id === id);
  if (!list) return 'missing';
  if ((list.works?.length ?? 0) + add.length > MAX_WORKS) return 'full';
  const where = { _id: userId, 'lists.id': id };
  // Each saying when it was put in, unless it says so already
  const now = new Date().toISOString();
  const dated = add.map((work) => ({ addedAt: now, ...work }));
  const out = [...remove, ...add.map((work) => work.workKey)];
  // Each a change of its own, so two made at once both hold
  if (out.length)
    await lists().updateOne(where, {
      $pull: { 'lists.$.works': { workKey: { $in: out } } },
    });
  await lists().updateOne(where, {
    ...(add.length && { $push: { 'lists.$.works': { $each: dated } } }),
    $set: { updatedAt: new Date() },
  });
  return 'changed';
}

// How many books are in each list, by id: those on the shelves in it, and
// those from the catalogue in it, but not twice over for a work there is
// a copy of in it too
export async function countByList(userId: ObjectId, all: BookListNode[]) {
  const rows = await books()
    .aggregate<{ _id: string; count: number; works: string[] }>([
      { $match: { userId, lists: { $exists: true, $ne: [] } } },
      { $unwind: '$lists' },
      {
        $group: {
          _id: '$lists',
          count: { $sum: 1 },
          works: { $addToSet: '$openLibrary.work' },
        },
      },
    ])
    .toArray();
  const shelved = new Map(rows.map((row) => [row._id, row]));
  return Object.fromEntries(
    all.map((list) => {
      const row = shelved.get(list.id);
      const copies = new Set(row?.works);
      const works = (list.works ?? []).filter(
        (work) => !copies.has(work.workKey),
      );
      return [list.id, (row?.count ?? 0) + works.length];
    }),
  );
}

// Of `ids`, those of lists the reader has, once each
export const ownLists = (all: BookListNode[], ids: string[]) => {
  const known = new Set(all.map((list) => list.id));
  return [...new Set(ids)].filter((id) => known.has(id));
};
