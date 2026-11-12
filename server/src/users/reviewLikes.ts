import { ObjectId } from 'mongodb';
import { books, reviewLikes } from '../db.js';
import { readersByIds } from './repository.js';
import { HttpError } from '../lib/errors.js';
import { objectIdOr } from '../lib/validation.js';
import { forget, note } from './activity.js';

// Hearts on readers' reviews: one from each reader on each review that's
// another's, taken back as they like; counted for a book's page

// How many of a review's hearts tell who gave them
const NAMED = 20;

const noSuchReview = () =>
  new HttpError(404, 'not_found', 'There’s no such review.');

// `me`'s heart on the review kept on the copy `id`, or taken back (`on`)
export async function likeReview(id: string, me: ObjectId, on: boolean) {
  const review = objectIdOr(id, noSuchReview);
  if (!on) {
    await reviewLikes().deleteOne({ review, userId: me });
    await forget({ userId: me, kind: 'liked', book: review });
    return;
  }
  const book = await books().findOne(
    { _id: review, 'copy.review': { $type: 'string', $ne: '' } },
    { projection: { userId: 1 } },
  );
  if (!book) throw noSuchReview();
  if (book.userId.equals(me))
    throw new HttpError(400, 'own_review', 'That one’s yours.');
  const { upsertedCount } = await reviewLikes().updateOne(
    { review, userId: me },
    { $setOnInsert: { createdAt: new Date() } },
    { upsert: true },
  );
  // Told to the one who wrote it, the first time
  if (upsertedCount)
    await note({
      userId: me,
      kind: 'liked',
      book: review,
      target: book.userId,
    });
}

// How many hearts each of the reviews `ids` has, and whether `me` gave one
export async function likesOf(ids: ObjectId[], me: ObjectId) {
  const rows = await reviewLikes()
    .aggregate<{ _id: ObjectId; count: number; mine: number }>([
      { $match: { review: { $in: ids } } },
      {
        $group: {
          _id: '$review',
          count: { $sum: 1 },
          mine: { $max: { $cond: [{ $eq: ['$userId', me] }, 1, 0] } },
        },
      },
    ])
    .toArray();
  return new Map(
    rows.map((row) => [
      row._id.toHexString(),
      { likes: row.count, liked: row.mine === 1 },
    ]),
  );
}

// A reader's hearts, and those on their reviews, as they leave
export async function deleteLikes(me: ObjectId) {
  const theirs = await books().distinct('_id', {
    userId: me,
    'copy.review': { $type: 'string' },
  });
  await reviewLikes().deleteMany({
    $or: [{ userId: me }, { review: { $in: theirs } }],
  });
}

// The hearts on the reviews kept on the copies `ids`, as they go
export const deleteLikesOn = (ids: ObjectId[]) =>
  reviewLikes()
    .deleteMany({ review: { $in: ids } })
    .then(() => {});

// Who gave their hearts to `me`'s own review, kept on their copy `id`: how
// many, and the latest of them; none for a copy that isn't theirs
export async function heartsOnMine(id: string, me: ObjectId) {
  if (!ObjectId.isValid(id)) return { likes: 0, readers: [] };
  const review = new ObjectId(id);
  const mine = await books().countDocuments({ _id: review, userId: me });
  if (!mine) return { likes: 0, readers: [] };
  const [likes, latest] = await Promise.all([
    reviewLikes().countDocuments({ review }),
    reviewLikes()
      .find(
        { review },
        { sort: { createdAt: -1 }, limit: NAMED, projection: { userId: 1 } },
      )
      .toArray(),
  ]);
  const { readers } = await readersByIds(latest.map((each) => each.userId));
  return { likes, readers };
}
