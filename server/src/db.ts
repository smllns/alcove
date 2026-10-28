import { MongoClient, type Db, type ObjectId } from 'mongodb';
import { config } from './config.js';

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

// Where a cover came from: the catalogue (shown from there), a photo the
// reader uploaded, or a catalogue cover a copy was once kept of (no longer
// made: every copy cost one of the storage's few counted operations a
// month). The last two are files in our own storage.
export const coverSources = ['openlibrary', 'upload', 'mirror'] as const;
export type CoverSource = (typeof coverSources)[number];
export const storedCoverSources: CoverSource[] = ['upload', 'mirror'];

// Where a reader keeps books, named however they like: homes, the rooms in
// them, the bookcases (or chests, or boxes) in those, and their shelves.
// Only the home is required of a book's place; the rest narrows it down.
export type ShelfNode = { id: string; name: string };
export type UnitNode = { id: string; name: string; shelves: ShelfNode[] };
export type RoomNode = { id: string; name: string; units: UnitNode[] };
export type HomeNode = { id: string; name: string; rooms: RoomNode[] };

// One per reader, keyed by their id
export type PlacesDoc = {
  _id: ObjectId;
  homes: HomeNode[];
  updatedAt: Date;
};

// A spot in that tree
export type PlaceRef = {
  home: string;
  room?: string;
  unit?: string;
  shelf?: string;
};

// The reader's own lists of books (to read this summer, the best of the
// year, …), named however they like; one document per reader, keyed by
// their id. A book says which lists it's in.
export type BookListNode = { id: string; name: string };
export type ListsDoc = {
  _id: ObjectId;
  lists: BookListNode[];
  updatedAt: Date;
};

// On the reader's shelf, lent to someone, or someone else's book on loan
export const copyStatuses = ['shelf', 'lent', 'borrowed'] as const;
export type CopyStatus = (typeof copyStatuses)[number];
export const copyConditions = ['new', 'good', 'worn', 'battered'] as const;
export type CopyCondition = (typeof copyConditions)[number];
export const readingStates = ['read', 'reading', 'unread'] as const;
export type ReadingState = (typeof readingStates)[number];

// How the book is bound: in boards, in paper, or pocket-sized
export const bookFormats = ['hardcover', 'paperback', 'pocket'] as const;
export type BookFormat = (typeof bookFormats)[number];

// The reader's own copy: where it is, who has it, what they make of it.
// Dates are calendar days (YYYY-MM-DD), not moments.
export type CopyDetails = {
  place?: PlaceRef;
  // The moment it was put there (not a day, unlike the rest), for those
  // put there last to stand last
  placedAt?: string;
  // Free text from before places existed
  location?: string;
  status: CopyStatus;
  // Whether the reader has read it yet, and when: a finish only for a book
  // that's been read
  reading?: ReadingState;
  started?: string;
  finished?: string;
  // Stars out of five, in halves
  rating?: number;
  // How it came to the reader: 'bought', 'gift', … or their own words
  acquired?: { how?: string; from?: string; date?: string };
  // Who it's lent to, or borrowed from
  person?: string;
  since?: string;
  due?: string;
  condition?: CopyCondition;
  // What the reader thought of it, in one piece
  review?: string;
  // Things worth saying about it, one at a time
  notes?: string[];
  quotes?: string[];
  // e.g. { label: 'Spotify playlist', url: 'https://open.spotify.com/…' }
  links?: { label?: string; url: string }[];
};

// One physical copy on someone's shelves
export type BookDoc = {
  _id: ObjectId;
  userId: ObjectId;
  title: string;
  subtitle?: string;
  authors: string[];
  isbn?: string;
  publisher?: string;
  // The year the book first came out, in any edition; and the year of
  // this copy's edition
  firstPublishedYear?: number;
  publishedYear?: number;
  pages?: number;
  language?: string;
  originalLanguage?: string;
  originalTitle?: string;
  translators?: string[];
  series?: { name: string; number?: number };
  format?: BookFormat;
  genres?: string[];
  // The ids of the reader's lists it's in
  lists?: string[];
  // What it's about, from the catalogue or in the reader's own words
  description?: string;
  // How readers rate it elsewhere, out of five, as the reader put it: only
  // for a book the catalogue has no ratings for (those are asked afresh)
  averageRating?: number;
  cover?: { url: string; source: CoverSource };
  // Where the details came from, for refreshing them later
  openLibrary?: { work?: string; edition?: string };
  copy?: CopyDetails;
  createdAt: Date;
  updatedAt: Date;
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
