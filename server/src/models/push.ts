import type { ObjectId } from 'mongodb';

// One of a reader's devices that takes notifications (a phone with alcove
// on its home screen, a browser), as its push service knows it
export type PushSubscriptionDoc = {
  _id: ObjectId;
  userId: ObjectId;
  // Where its push service takes messages for it, and the keys a message
  // is sealed with for it alone
  endpoint: string;
  keys: { p256dh: string; auth: string };
  createdAt: Date;
};
