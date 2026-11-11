import type { ObjectId } from 'mongodb';

// One reader following another, to see what they add, finish and love:
// at once (`following`), or, for a reader whose page opens only to those
// they let in, once they've said yes (`asked` till then)
export type FollowDoc = {
  _id: ObjectId;
  follower: ObjectId;
  followee: ObjectId;
  state: 'following' | 'asked';
  createdAt: Date;
};
