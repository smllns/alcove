import { ObjectId } from 'mongodb';
import {
  books,
  lists,
  type BookListNode,
  type ListedWorkNode,
  type SavedListNode,
} from '../db.js';

// Most a reader can have, and most books from the catalogue in one; far
// more than anyone keeps
const MAX_LISTS = 200;
const MAX_WORKS = 1000;
const MAX_SAVED = 200;

export const getLists = async (userId: ObjectId) =>
  (await lists().findOne({ _id: userId }))?.lists ?? [];

export const deleteLists = (userId: ObjectId) =>
  lists().deleteOne({ _id: userId });

// Two names the same but for capitals: "Summer reads", "summer Reads"
const sameName = (a: string, b: string) =>
  a.localeCompare(b, undefined, { sensitivity: 'accent' }) === 0;

// A new list, at the end, public if `open`. One by that name
// already is the one meant.
export async function createList(
  userId: ObjectId,
  name: string,
  open: boolean,
) {
  const all = await getLists(userId);
  const known = all.find((list) => sameName(list.name, name));
  if (known) return known;
  if (all.length >= MAX_LISTS) return null;
  const list: BookListNode = {
    id: new ObjectId().toHexString(),
    name,
    public: open,
  };
  await lists().updateOne(
    { _id: userId },
    { $push: { lists: list }, $set: { updatedAt: new Date() } },
    { upsert: true },
  );
  return list;
}

// Renamed, unless another list has that name already ('taken'), and made
// public or private
export async function changeList(
  userId: ObjectId,
  id: string,
  change: { name?: string; public?: boolean },
) {
  const all = await getLists(userId);
  if (!all.some((list) => list.id === id)) return 'missing';
  const { name } = change;
  if (
    name !== undefined &&
    all.some((list) => list.id !== id && sameName(list.name, name))
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
        updatedAt: new Date(),
      },
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
  const out = [...remove, ...add.map((work) => work.workKey)];
  // Each a change of its own, so two made at once both hold
  if (out.length)
    await lists().updateOne(where, {
      $pull: { 'lists.$.works': { workKey: { $in: out } } },
    });
  await lists().updateOne(where, {
    ...(add.length && { $push: { 'lists.$.works': { $each: add } } }),
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

// Other readers' lists the reader's kept, the last kept first
export const getSaved = async (userId: ObjectId) =>
  ((await lists().findOne({ _id: userId }))?.saved ?? []).sort(
    (a, b) => b.savedAt.getTime() - a.savedAt.getTime(),
  );

// Kept, as it is now (kept already, kept afresh); false when there'd be
// too many
export async function saveList(
  userId: ObjectId,
  list: Omit<SavedListNode, 'savedAt'>,
) {
  const saved = await getSaved(userId);
  const others = saved.filter(
    (each) => !(each.kind === list.kind && each.ref === list.ref),
  );
  if (others.length >= MAX_SAVED) return false;
  await lists().updateOne(
    { _id: userId },
    {
      $set: {
        saved: [...others, { ...list, savedAt: new Date() }],
        updatedAt: new Date(),
      },
      $setOnInsert: { lists: [] },
    },
    { upsert: true },
  );
  return true;
}

export const unsaveList = (userId: ObjectId, kind: string, ref: string) =>
  lists().updateOne({ _id: userId }, {
    $pull: { saved: { kind, ref } },
    $set: { updatedAt: new Date() },
  } as never);
