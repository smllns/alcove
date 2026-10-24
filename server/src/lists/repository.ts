import { ObjectId } from 'mongodb';
import { books, lists, type BookListNode } from '../db.js';

// Most a reader can have; far more than anyone keeps
const MAX_LISTS = 200;

export const getLists = async (userId: ObjectId) =>
  (await lists().findOne({ _id: userId }))?.lists ?? [];

export const deleteLists = (userId: ObjectId) =>
  lists().deleteOne({ _id: userId });

// Two names the same but for capitals: "Summer reads", "summer Reads"
const sameName = (a: string, b: string) =>
  a.localeCompare(b, undefined, { sensitivity: 'accent' }) === 0;

// A new list, at the end. One by that name already is the one meant.
export async function createList(userId: ObjectId, name: string) {
  const all = await getLists(userId);
  const known = all.find((list) => sameName(list.name, name));
  if (known) return known;
  if (all.length >= MAX_LISTS) return null;
  const list: BookListNode = { id: new ObjectId().toHexString(), name };
  await lists().updateOne(
    { _id: userId },
    { $push: { lists: list }, $set: { updatedAt: new Date() } },
    { upsert: true },
  );
  return list;
}

// Renamed, unless another list has that name already: 'taken'
export async function renameList(userId: ObjectId, id: string, name: string) {
  const all = await getLists(userId);
  if (!all.some((list) => list.id === id)) return 'missing';
  if (all.some((list) => list.id !== id && sameName(list.name, name)))
    return 'taken';
  await lists().updateOne(
    { _id: userId, 'lists.id': id },
    { $set: { 'lists.$.name': name, updatedAt: new Date() } },
  );
  return 'renamed';
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

// How many books are in each list, by id
export async function countByList(userId: ObjectId) {
  const rows = await books()
    .aggregate<{ _id: string; count: number }>([
      { $match: { userId, lists: { $exists: true, $ne: [] } } },
      { $unwind: '$lists' },
      { $group: { _id: '$lists', count: { $sum: 1 } } },
    ])
    .toArray();
  return Object.fromEntries(rows.map((row) => [row._id, row.count]));
}

// Of `ids`, those of lists the reader has, once each
export const ownLists = (all: BookListNode[], ids: string[]) => {
  const known = new Set(all.map((list) => list.id));
  return [...new Set(ids)].filter((id) => known.has(id));
};
