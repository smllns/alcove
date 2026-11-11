import type { ObjectId } from 'mongodb';
import { follows, users, type UserDoc } from '../db.js';
import { privacyOf } from './privacy.js';
import { asReader, listed } from './repository.js';

// Readers following readers: followed at once, or asked for of one whose
// page opens only to those they let in, and let in or turned away by them

export type FollowState = 'following' | 'asked' | 'none';

// How `follower` stands to `followee`
export async function followState(
  follower: ObjectId,
  followee: ObjectId,
): Promise<FollowState> {
  const found = await follows().findOne({ follower, followee });
  return found?.state ?? 'none';
}

// Followed, or asked to be, as `followee` has it; what that came to
export async function follow(follower: ObjectId, followee: UserDoc) {
  const state =
    privacyOf(followee).page === 'ask' ? 'asked' : ('following' as const);
  const done = await follows().findOneAndUpdate(
    { follower, followee: followee._id },
    { $setOnInsert: { state, createdAt: new Date() } },
    { upsert: true, returnDocument: 'after' },
  );
  return done?.state ?? state;
}

// No longer followed, nor asked to be
export const unfollow = (follower: ObjectId, followee: ObjectId) =>
  follows().deleteOne({ follower, followee });

// How many follow `id`, and how many they follow
export async function followCounts(id: ObjectId) {
  const [followers, following] = await Promise.all([
    follows().countDocuments({ followee: id, state: 'following' }),
    follows().countDocuments({ follower: id, state: 'following' }),
  ]);
  return { followers, following };
}

// How many ask to follow `id`
export const askingCount = (id: ObjectId) =>
  follows().countDocuments({ followee: id, state: 'asked' });

// The readers on one side of `id`'s follows: who follow them, who they
// follow, or who ask to follow them; the latest first
export async function people(
  id: ObjectId,
  side: 'followers' | 'following' | 'asking',
) {
  const rows = await follows()
    .find(
      side === 'following'
        ? { follower: id, state: 'following' }
        : { followee: id, state: side === 'asking' ? 'asked' : 'following' },
      { sort: { createdAt: -1 }, limit: 500 },
    )
    .toArray();
  const ids = rows.map((row) =>
    side === 'following' ? row.followee : row.follower,
  );
  const found = await users()
    .find({ _id: { $in: ids }, username: { $type: 'string' } }, listed)
    .toArray();
  const byId = new Map(found.map((user) => [user._id.toHexString(), user]));
  return ids.flatMap((each) => {
    const user = byId.get(each.toHexString());
    return user ? [asReader(user)] : [];
  });
}

// One asking to follow `followee` let in (true) or turned away; whether
// they were asking
export async function answer(
  followee: ObjectId,
  follower: ObjectId,
  yes: boolean,
) {
  const where = { followee, follower, state: 'asked' as const };
  const { matchedCount } = yes
    ? await follows().updateOne(where, { $set: { state: 'following' } })
    : { matchedCount: (await follows().deleteOne(where)).deletedCount };
  return matchedCount > 0;
}

// A page opened to everyone: all who were asking let in
export const letAllIn = (followee: ObjectId) =>
  follows().updateMany(
    { followee, state: 'asked' },
    { $set: { state: 'following' } },
  );

// A reader leaving: every follow on either side gone with them
export const deleteFollows = (id: ObjectId) =>
  follows().deleteMany({ $or: [{ follower: id }, { followee: id }] });
