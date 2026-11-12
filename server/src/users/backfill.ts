import type { Filter, ObjectId } from 'mongodb';
import {
  activity,
  books,
  follows,
  reviewLikes,
  type ActivityDoc,
} from '../db.js';

// The feeds began with what readers did from then on; what they'd done
// before is told once from their books, so a follower sees what came since
// they followed even from before the feeds: each book added (when it came
// to the shelves), begun and finished (the days given, at their end, as
// the hour isn't known), and reviewed (when it was last changed); and each
// follow (or ask to follow) told to the one followed, and each heart told
// to the one whose review it's on. Not those
// brought over from another site all at once, as an import doesn't go to
// the feeds either. Done once (migrations.ts); what's already noted, left
// as it is.

const BATCH = 500;

// The end of a day given as YYYY-MM-DD
const endOf = (day: string) => new Date(`${day}T23:59:59`);

const hex = (id?: ObjectId) => id?.toHexString();

// What's already noted of what `filter` finds, each told by `keyOf`
const knownKeys = async (
  filter: Filter<ActivityDoc>,
  keyOf: (event: ActivityDoc) => string,
) =>
  new Set(
    (
      await activity()
        .find(filter, {
          projection: { userId: 1, kind: 1, book: 1, target: 1 },
        })
        .toArray()
    ).map(keyOf),
  );

export async function backfillActivity() {
  const known = await knownKeys(
    { book: { $exists: true } },
    (each) => `${hex(each.book)}:${each.kind}`,
  );
  const shelved = books().find(
    { importId: { $exists: false } },
    { projection: { userId: 1, createdAt: 1, updatedAt: 1, copy: 1 } },
  );
  let batch: Omit<ActivityDoc, '_id'>[] = [];
  for await (const book of shelved) {
    const told = (kind: ActivityDoc['kind'], at: Date | undefined) => {
      if (at && !Number.isNaN(+at) && !known.has(`${hex(book._id)}:${kind}`))
        batch.push({
          userId: book.userId,
          kind,
          book: book._id,
          createdAt: at,
        });
    };
    const copy = book.copy;
    told('added', book.createdAt);
    if (copy?.started && copy.reading) told('started', endOf(copy.started));
    if (copy?.finished && copy.reading === 'read')
      told('finished', endOf(copy.finished));
    if (copy?.review?.trim()) told('reviewed', book.updatedAt);
    if (batch.length >= BATCH) {
      await activity().insertMany(batch as ActivityDoc[]);
      batch = [];
    }
  }
  if (batch.length) await activity().insertMany(batch as ActivityDoc[]);

  // Each follow, told to the one followed, as it was then
  const told = await knownKeys(
    { kind: { $in: ['followed', 'asked'] } },
    (each) => `${hex(each.userId)}:${hex(each.target)}`,
  );
  const followed = (await follows().find().toArray())
    .filter((each) => !told.has(`${hex(each.follower)}:${hex(each.followee)}`))
    .map((each) => ({
      userId: each.follower,
      kind: each.state === 'asked' ? ('asked' as const) : ('followed' as const),
      target: each.followee,
      createdAt: each.createdAt,
    }));
  if (followed.length) await activity().insertMany(followed as ActivityDoc[]);

  // Each heart, told to the one whose review it's on, as it was given
  const hearted = await knownKeys(
    { kind: 'liked' },
    (each) => `${hex(each.userId)}:${hex(each.book)}`,
  );
  const likes = await reviewLikes().find().toArray();
  const owners = new Map(
    (
      await books()
        .find(
          { _id: { $in: likes.map((each) => each.review) } },
          { projection: { userId: 1 } },
        )
        .toArray()
    ).map((book) => [hex(book._id), book.userId]),
  );
  const liked = likes.flatMap((each) => {
    const owner = owners.get(hex(each.review));
    return owner && !hearted.has(`${hex(each.userId)}:${hex(each.review)}`)
      ? [
          {
            userId: each.userId,
            kind: 'liked' as const,
            book: each.review,
            target: owner,
            createdAt: each.createdAt,
          },
        ]
      : [];
  });
  if (liked.length) await activity().insertMany(liked as ActivityDoc[]);
}
