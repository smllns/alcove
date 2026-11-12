import type { ObjectId } from 'mongodb';

// Something a reader did, for the feeds of those who follow them (a book
// added, begun, finished or reviewed), or for one reader alone (`target`):
// a heart on their review, a follow, or an ask to follow
export type ActivityKind =
  | 'added'
  | 'started'
  | 'finished'
  | 'reviewed'
  | 'liked'
  | 'followed'
  | 'asked';

export type ActivityDoc = {
  _id: ObjectId;
  // Who did it
  userId: ObjectId;
  kind: ActivityKind;
  // The book it's about: their copy, or (a heart) the copy reviewed
  book?: ObjectId;
  // Whom it's for alone
  target?: ObjectId;
  createdAt: Date;
};
