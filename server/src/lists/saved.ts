import type { ObjectId } from 'mongodb';
import { lists, type SavedListNode } from '../db.js';

// Other readers' lists the reader keeps to come back to: another reader's
// public one, or one made on Open Library

// Most a reader can keep; far more than anyone does
const MAX_SAVED = 200;

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
