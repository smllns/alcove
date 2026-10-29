import type { ObjectId } from 'mongodb';

// The reader's own lists of books (to read this summer, the best of the
// year, …), named however they like; one document per reader, keyed by
// their id. A book on the shelves says which lists it's in; a book from
// the catalogue that isn't is kept in the list itself (`works`).
export type BookListNode = {
  id: string;
  name: string;
  works?: ListedWorkNode[];
  // Found by other readers, and opened by them, but never changed
  public?: boolean;
};

// A book from the catalogue in a list, as the catalogue had it when it was
// put in: what's needed to show it, nothing asked for again
export type ListedWorkNode = {
  workKey: string;
  title: string;
  authors: string[];
  coverUrl?: string;
  firstPublishYear?: number;
  editionCount?: number;
};
export type ListsDoc = {
  _id: ObjectId;
  lists: BookListNode[];
  // Other readers' lists kept to come back to: another reader's public one
  // (`shared`, by its id) or one made on Open Library (`readers`, by
  // owner/id), as it was when kept, enough to draw its pile
  saved?: SavedListNode[];
  updatedAt: Date;
};

export type SavedListNode = {
  kind: 'shared' | 'readers';
  ref: string;
  name: string;
  books: number;
  // The first of its books, for its pile
  works: ListedWorkNode[];
  savedAt: Date;
};
