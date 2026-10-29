import type { ObjectId } from 'mongodb';
import type { PlaceRef } from './places.js';

// Where a cover came from: the catalogue (shown from there), a photo the
// reader uploaded, or a catalogue cover a copy was once kept of (no longer
// made: every copy cost one of the storage's few counted operations a
// month). The last two are files in our own storage.
export const coverSources = ['openlibrary', 'upload', 'mirror'] as const;
export type CoverSource = (typeof coverSources)[number];
export const storedCoverSources: CoverSource[] = ['upload', 'mirror'];

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
