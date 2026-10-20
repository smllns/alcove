import type { PlaceRef } from '@/entities/place/types';

// A physical copy on the reader's shelves. Mirrors toPublicBook on the server.
export type Book = {
  id: string;
  title: string;
  subtitle?: string;
  authors: string[];
  isbn?: string;
  publisher?: string;
  publishedYear?: number;
  pages?: number;
  language?: string;
  originalLanguage?: string;
  originalTitle?: string;
  translators?: string[];
  series?: { name: string; number?: number };
  format?: BookFormat;
  genres?: string[];
  cover?: BookCover;
  openLibrary?: { work?: string; edition?: string };
  copy?: CopyDetails;
  createdAt: string;
  updatedAt: string;
};

export type BookCover = {
  url: string;
  // From the catalogue, or a photo the reader took
  source: 'openlibrary' | 'upload';
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
  // Free text from before places existed
  location?: string;
  status: CopyStatus;
  // Whether the reader has read it yet
  reading?: ReadingState;
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
