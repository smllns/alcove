import { MongoClient, type Db, type ObjectId } from 'mongodb';
import { config } from './config.js';
import type { BookDoc } from './models/books.js';
import type { CatalogueEditionDoc } from './models/catalogue.js';
import type { FollowDoc } from './models/follows.js';
import type { ListsDoc } from './models/lists.js';
import type { PlacesDoc } from './models/places.js';

// The documents kept, each area's in a file of its own
export * from './models/books.js';
export * from './models/catalogue.js';
export * from './models/follows.js';
export * from './models/lists.js';
export * from './models/places.js';

export type UserDoc = {
  _id: ObjectId;
  email: string;
  // What they'd like to be called, if they've said (it's optional)
  name?: string;
  // What others find them by and see them as (@name), always lowercase.
  // Asked for on signing up; readers from before then choose one in
  // settings.
  username?: string;
  // A line or two about themselves, on their page
  about?: string;
  // Their own photo, uploaded (uploads/storage.ts); taken away, it's
  // stored empty
  avatarUrl?: string;
  // Who may open their page, and see each part of it (users/privacy.ts);
  // what's not said, as usual
  privacy?: Partial<PrivacyNode>;
  passwordHash: string;
  createdAt: Date;
  // When their uploads were last swept for ones no book uses
  coversSweptAt?: Date;
};

// Who may see what of a reader. Mirrors Privacy in users/privacy.ts.
export type Audience = 'everyone' | 'followers' | 'me';
export type PrivacyNode = {
  page: 'open' | 'ask';
  books: Audience;
  reading: Audience;
  stars: Audience;
  year: Audience;
  quotes: Audience;
};

export type SessionDoc = {
  // SHA-256 of the token in the cookie; the raw token is never stored
  _id: string;
  userId: ObjectId;
  createdAt: Date;
  expiresAt: Date;
};

// Answers from Open Library, kept for a while so repeat searches are instant
export type LookupCacheDoc = {
  _id: string;
  value: unknown;
  // Gone once this passes (Mongo deletes it)
  expiresAt: Date;
  // For an answer kept past its time (cachedStale): when it's due to be
  // asked afresh
  freshUntil?: Date;
};

const client = new MongoClient(config.MONGODB_URI, {
  serverSelectionTimeoutMS: 10_000,
  // An optional field left empty is simply absent, not stored as null
  ignoreUndefined: true,
});

let db: Db | null = null;

export async function connectDb() {
  await client.connect();
  db = client.db(config.MONGODB_DB);
  await ensureIndexes(db);
  return db;
}

export const disconnectDb = () => client.close();

function database() {
  if (!db) throw new Error('Database used before connectDb()');
  return db;
}

export const users = () => database().collection<UserDoc>('users');
export const sessions = () => database().collection<SessionDoc>('sessions');
export const books = () => database().collection<BookDoc>('books');
export const places = () => database().collection<PlacesDoc>('places');
export const lists = () => database().collection<ListsDoc>('lists');
export const follows = () => database().collection<FollowDoc>('follows');
export const editions = () =>
  database().collection<CatalogueEditionDoc>('editions');
export const lookupCache = () =>
  database().collection<LookupCacheDoc>('lookupCache');

export async function pingDb() {
  await database().command({ ping: 1 });
}

async function ensureIndexes(db: Db) {
  await db.collection<UserDoc>('users').createIndexes([
    { key: { email: 1 }, unique: true },
    // Each taken once, among those who've chosen one
    {
      key: { username: 1 },
      unique: true,
      partialFilterExpression: { username: { $type: 'string' } },
    },
  ]);
  // Mongo deletes sessions on its own once expiresAt passes
  await db
    .collection<SessionDoc>('sessions')
    .createIndexes([
      { key: { expiresAt: 1 }, expireAfterSeconds: 0 },
      { key: { userId: 1 } },
    ]);
  // Each reader followed once by each other; and those a reader follows,
  // and who follow them (or ask to), found and counted by either side,
  // the latest first
  await db
    .collection<FollowDoc>('follows')
    .createIndexes([
      { key: { follower: 1, followee: 1 }, unique: true },
      { key: { followee: 1, state: 1, createdAt: -1 } },
      { key: { follower: 1, state: 1, createdAt: -1 } },
    ]);
  // A reader's shelf, newest first; the sort key doubles as the page cursor.
  // And as it came to them, newest first (their page, their lists)
  await db
    .collection<BookDoc>('books')
    .createIndexes([
      { key: { userId: 1, _id: -1 } },
      { key: { userId: 1, createdAt: -1 } },
    ]);
  await db
    .collection<LookupCacheDoc>('lookupCache')
    .createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
  // alcove's own printings found by words of their titles and writers, in
  // any language (no stemming)
  await db
    .collection<CatalogueEditionDoc>('editions')
    .createIndex(
      { title: 'text', authors: 'text' },
      { weights: { title: 3, authors: 1 }, default_language: 'none' },
    );
}
