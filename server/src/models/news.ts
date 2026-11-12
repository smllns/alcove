import type { ObjectId } from 'mongodb';

// A piece of alcove's own news, written by one of those who run it, in
// every reader's feed: its headline, a few lines, and a way on (into the
// app, or out to the web), if it has one
export type NewsDoc = {
  _id: ObjectId;
  title: string;
  body: string;
  link?: { label: string; to: string };
  createdAt: Date;
  updatedAt: Date;
};
