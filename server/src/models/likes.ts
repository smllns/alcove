import type { ObjectId } from 'mongodb';

// A reader's heart on another's review of a book (the review kept on that
// reader's copy, by the copy's id), once each
export type ReviewLikeDoc = {
  _id: ObjectId;
  review: ObjectId;
  userId: ObjectId;
  createdAt: Date;
};
