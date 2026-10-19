import { MongoClient, type Db, type ObjectId } from 'mongodb';
import { config } from './config.js';

export type UserDoc = {
  _id: ObjectId;
  email: string;
  name: string;
  passwordHash: string;
  createdAt: Date;
};

export type SessionDoc = {
  // SHA-256 of the token in the cookie; the raw token is never stored
  _id: string;
  userId: ObjectId;
  createdAt: Date;
  expiresAt: Date;
};

const client = new MongoClient(config.MONGODB_URI, {
  serverSelectionTimeoutMS: 10_000,
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

export async function pingDb() {
  await database().command({ ping: 1 });
}

async function ensureIndexes(db: Db) {
  await db
    .collection<UserDoc>('users')
    .createIndex({ email: 1 }, { unique: true });
  // Mongo deletes sessions on its own once expiresAt passes
  await db
    .collection<SessionDoc>('sessions')
    .createIndexes([
      { key: { expiresAt: 1 }, expireAfterSeconds: 0 },
      { key: { userId: 1 } },
    ]);
}
