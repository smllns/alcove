import { MongoClient, type Db, type ObjectId } from 'mongodb';
import { config } from './config.js';
import type { BookDoc } from './models/books.js';
import type { ListsDoc } from './models/lists.js';
import type { PlacesDoc } from './models/places.js';

// The documents kept, each area's in a file of its own
export * from './models/books.js';
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
  passwordHash: string;
  createdAt: Date;
  // When their uploads were last swept for ones no book uses
  coversSweptAt?: Date;
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
  // A reader's shelf, newest first; the sort key doubles as the page cursor
  await db.collection<BookDoc>('books').createIndex({ userId: 1, _id: -1 });
  await db
    .collection<LookupCacheDoc>('lookupCache')
    .createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
}
