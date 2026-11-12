import type { Db } from 'mongodb';
import type {
  ActivityDoc,
  BookDoc,
  CatalogueEditionDoc,
  FollowDoc,
  LookupCacheDoc,
  NewsDoc,
  ReviewLikeDoc,
  SessionDoc,
  UserDoc,
  WriterNameDoc,
} from './db.js';

// The indexes each collection is kept with, made (where they aren't yet)
// as the server connects
export async function ensureIndexes(db: Db) {
  // Each collection's, all asked for at once
  await Promise.all([
    db.collection<UserDoc>('users').createIndexes([
      { key: { email: 1 }, unique: true },
      // Each taken once, among those who've chosen one
      {
        key: { username: 1 },
        unique: true,
        partialFilterExpression: { username: { $type: 'string' } },
      },
      // Those who keep part of their page from strangers, found at once
      // (strangersSee): only readers who've said so are in these
      ...(['page', 'books', 'stars'] as const).map((part) => ({
        key: { [`privacy.${part}`]: 1 },
        partialFilterExpression: { [`privacy.${part}`]: { $exists: true } },
      })),
    ]),
    // Mongo deletes sessions on its own once expiresAt passes
    db
      .collection<SessionDoc>('sessions')
      .createIndexes([
        { key: { expiresAt: 1 }, expireAfterSeconds: 0 },
        { key: { userId: 1 } },
      ]),
    // Each reader followed once by each other; and those a reader follows,
    // and who follow them (or ask to), found and counted by either side,
    // the latest first
    db
      .collection<FollowDoc>('follows')
      .createIndexes([
        { key: { follower: 1, followee: 1 }, unique: true },
        { key: { followee: 1, state: 1, createdAt: -1 } },
        { key: { follower: 1, state: 1, createdAt: -1 } },
      ]),
    // Each review liked once by each reader, its hearts counted by it; a
    // reader's own, found to go with them; and a review's, the latest first
    db
      .collection<ReviewLikeDoc>('reviewLikes')
      .createIndexes([
        { key: { review: 1, userId: 1 }, unique: true },
        { key: { userId: 1 } },
        { key: { review: 1, createdAt: -1 } },
      ]),
    // What readers did, the latest first: by who did it (their followers'
    // feeds), by whom it's for (a reader's own), and by book (gone with it)
    db
      .collection<ActivityDoc>('activity')
      .createIndexes([
        { key: { userId: 1, createdAt: -1 } },
        { key: { target: 1, createdAt: -1 } },
        { key: { book: 1 } },
      ]),
    // A writer's names, found together by their item
    db.collection<WriterNameDoc>('writerNames').createIndex({ item: 1 }),
    // alcove's news, the latest first
    db.collection<NewsDoc>('news').createIndex({ createdAt: -1 }),
    // A reader's shelf, newest first; the sort key doubles as the page cursor.
    // And as it came to them, newest first (their page, their lists)
    db.collection<BookDoc>('books').createIndexes([
      { key: { userId: 1, _id: -1 } },
      { key: { userId: 1, createdAt: -1 } },
      // Every reader's copies of a work, the latest changed first (its
      // rating, readers' reviews, what readers say it's about)
      {
        key: { 'openLibrary.work': 1, updatedAt: -1 },
        partialFilterExpression: { 'openLibrary.work': { $type: 'string' } },
      },
    ]),
    db
      .collection<LookupCacheDoc>('lookupCache')
      .createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
    // alcove's own printings found by words of their titles and writers, in
    // any language (no stemming)
    db
      .collection<CatalogueEditionDoc>('editions')
      .createIndex(
        { title: 'text', authors: 'text' },
        { weights: { title: 3, authors: 1 }, default_language: 'none' },
      ),
  ]);
}
