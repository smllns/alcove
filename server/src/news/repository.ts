import { ObjectId } from 'mongodb';
import { config } from '../config.js';
import { news, type NewsDoc, type UserDoc } from '../db.js';

// alcove's own news: written by those who run it (their emails in
// ADMIN_EMAILS), read by everyone in their feed

// The most kept in a feed
const MOST = 20;

export const isAdmin = (user: Pick<UserDoc, 'email'>) =>
  config.admins.has(user.email.toLowerCase());

// A piece of news as anyone may read it
export const toPublicNews = (doc: NewsDoc) => ({
  id: doc._id.toHexString(),
  title: doc.title,
  body: doc.body,
  ...(doc.link && { link: doc.link }),
  at: doc.createdAt.toISOString(),
});

export const latestNews = async () =>
  (
    await news()
      .find({}, { sort: { createdAt: -1 }, limit: MOST })
      .toArray()
  ).map(toPublicNews);

type Written = Pick<NewsDoc, 'title' | 'body' | 'link'>;

export async function writeNews(written: Written) {
  const now = new Date();
  const doc = {
    _id: new ObjectId(),
    ...written,
    createdAt: now,
    updatedAt: now,
  };
  await news().insertOne(doc);
  return toPublicNews(doc);
}

export async function rewriteNews(id: ObjectId, written: Written) {
  const set = {
    title: written.title,
    body: written.body,
    updatedAt: new Date(),
    ...(written.link && { link: written.link }),
  };
  const doc = await news().findOneAndUpdate(
    { _id: id },
    written.link ? { $set: set } : { $set: set, $unset: { link: '' } },
    { returnDocument: 'after' },
  );
  return doc && toPublicNews(doc);
}

export const unpublishNews = async (id: ObjectId) =>
  (await news().deleteOne({ _id: id })).deletedCount > 0;
