// The reader's own lists of books, named however they like. Mirrors the
// lists on the server; a book says which it's in (Book.lists).
export type BookList = { id: string; name: string };

// Every list, and how many books are in each by id
export type Lists = { lists: BookList[]; counts: Record<string, number> };
