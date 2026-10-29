// The reader's own lists of books, named however they like. Mirrors the
// lists on the server: a book on the shelves says which it's in
// (Book.lists); a book from the catalogue that isn't is kept in the list
// (`works`). A `public` one other readers may find and open.
export type BookList = {
  id: string;
  name: string;
  works?: ListedWork[];
  public?: boolean;
};

// A book from the catalogue in a list, as a search found it (a
// CatalogueWork). Mirrors ListedWorkNode on the server.
export type ListedWork = {
  workKey: string;
  title: string;
  subtitle?: string;
  authors: string[];
  coverUrl?: string;
  firstPublishYear?: number;
  editionCount: number;
};

// Another reader's public list, as it's found: whose it is (as they're
// called), and how many books it holds
export type SharedList = {
  id: string;
  name: string;
  owner: string;
  books: number;
};

// One opened, its books as the catalogue tells them; one not from the
// catalogue has a key of its own (book-…), and opens nothing
export type SharedListBooks = {
  id: string;
  name: string;
  owner: string;
  works: ListedWork[];
};

// Every list, and how many books are in each by id
export type Lists = { lists: BookList[]; counts: Record<string, number> };

// Another reader's list kept to come back to: theirs here (`shared`, by its
// id) or one made on Open Library (`readers`, by owner/id), as it was when
// kept, with the first of its books for its pile. Mirrors SavedListNode.
export type SavedList = {
  kind: 'shared' | 'readers';
  ref: string;
  name: string;
  books: number;
  works: ListedWork[];
  savedAt?: string;
};

// What a list made on Open Library's page is opened with: its name and how
// many books it holds, which its page can't always ask for
export type ListOpenState = { name: string; books: number };
