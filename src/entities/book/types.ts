import type { PlaceRef } from '@/entities/place/types';

// A physical copy on the reader's shelves. Mirrors toPublicBook on the server.
export type Book = {
  id: string;
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
  // The ids of the reader's lists it's in (entities/list)
  lists?: string[];
  // What it's about, from the catalogue or in the reader's own words
  description?: string;
  // How readers rate it elsewhere, out of five, as the reader put it: only
  // for a book the catalogue has no ratings for (those are asked afresh)
  averageRating?: number;
  cover?: BookCover;
  openLibrary?: { work?: string; edition?: string };
  copy?: CopyDetails;
  createdAt: string;
  updatedAt: string;
};

export type BookCover = {
  url: string;
  // The catalogue (shown from there), a photo the reader took, or a
  // catalogue cover a copy was once kept of. Mirrors the server.
  source: 'openlibrary' | 'upload' | 'mirror';
};

// On the reader's shelf, lent to someone, or someone else's book on loan
export type CopyStatus = 'shelf' | 'lent' | 'borrowed';
export type CopyCondition = 'new' | 'good' | 'worn' | 'battered';
export type ReadingState = 'read' | 'reading' | 'unread';

// How the book is bound: in boards, in paper, or pocket-sized. Mirrors the
// server.
export type BookFormat = 'hardcover' | 'paperback' | 'pocket';

// The reader's own copy. Mirrors CopyDetails on the server; dates are
// calendar days, YYYY-MM-DD.
export type CopyDetails = {
  place?: PlaceRef;
  // When it was put there (a moment), for those put there last to stand
  // last
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

// What's sent to create a book
export type BookInput = Omit<Book, 'id' | 'createdAt' | 'updatedAt'> & {
  // Add it even though the same book is already on the shelves
  anotherCopy?: boolean;
};

// From the catalogue: a book in general, across all its editions
export type CatalogueWork = {
  workKey: string;
  title: string;
  subtitle?: string;
  authors: string[];
  firstPublishYear?: number;
  coverUrl?: string;
  editionCount: number;
};

// A writer the catalogue knows, as a search finds them. Mirrors
// AuthorResult in server/src/lookup/authors.ts.
export type AuthorFound = {
  key: string;
  name: string;
  born?: string;
  died?: string;
  // Their best-known book, and how many they wrote
  topWork?: string;
  workCount: number;
};

// A list a reader made on Open Library: its name, its page, how many books
export type CatalogueList = { name: string; url: string; books: number };

// Who wrote a book, as the catalogue knows them. `wikipedia`: the article
// the lines about them come from, when they do, to credit.
export type CatalogueAuthor = {
  key: string;
  name: string;
  born?: number;
  died?: number;
  bio?: string;
  photoUrl?: string;
  wikipedia?: string;
};

// A book to read next, and its id if it's on the reader's shelves already
export type SimilarBook = CatalogueWork & { bookId?: string };

// What the page for adding a book may be opened with: one already found in
// the catalogue (a book to read next, say), to start from its details
export type AddBookState = { work?: CatalogueWork };

// From the catalogue: one specific printing
export type CatalogueEdition = {
  editionKey: string;
  title: string;
  subtitle?: string;
  isbn?: string;
  publisher?: string;
  publishedYear?: number;
  pages?: number;
  language?: string;
  format?: BookFormat;
  coverUrl?: string;
};

// How the catalogue's readers rate a book: the average out of five, and
// how many of them rated it
export type CatalogueRatings = { average: number; count: number };
