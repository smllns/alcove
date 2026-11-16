import type { Filter, ObjectId } from 'mongodb';
import { activity, type ActivityDoc, type BookDoc } from '../db.js';
import { tellDone } from '../push/messages.js';

// What readers do, kept for the feeds (users/feed.ts): noted as it's done,
// and let go of as it's undone (a heart taken back, a follow ended, a book
// or a reader gone)

// What's done for one reader alone is told on their devices too
export async function note(event: Omit<ActivityDoc, '_id' | 'createdAt'>) {
  await activity().insertOne({
    ...event,
    createdAt: new Date(),
  } as ActivityDoc);
  await tellDone(event).catch(() => {});
}

export const forget = (filter: Filter<ActivityDoc>) =>
  activity()
    .deleteMany(filter)
    .then(() => {});

// What a book's change says for the feeds: added; begun or finished, as
// its reading turns so; reviewed, as a review is first written
export async function noteBook(
  userId: ObjectId,
  was: BookDoc | null,
  book: BookDoc,
) {
  const kinds: ActivityDoc['kind'][] = [];
  const now = book.copy?.reading;
  if (!was) kinds.push('added');
  else if (now !== was.copy?.reading) {
    if (now === 'reading') kinds.push('started');
    if (now === 'read') kinds.push('finished');
  }
  if (book.copy?.review?.trim() && !was?.copy?.review?.trim())
    kinds.push('reviewed');
  await Promise.all(
    kinds.map((kind) => note({ userId, kind, book: book._id })),
  );
}

// A reader leaving: what they did, and what was for them
export const forgetReader = (id: ObjectId) =>
  forget({ $or: [{ userId: id }, { target: id }] });
