import { booksByWork } from '@/entities/book/booksByWork';
import { catalogueBook, workOfBook } from '@/entities/book/catalogueBook';
import type { Book } from '@/entities/book/types';
import type { BookList } from '@/entities/list/types';

// A list's books as shown: the reader's own put in it, then those from the
// catalogue kept in it, as they were put in: each the reader's own copy if
// they've one now, the catalogue's otherwise, and none twice
export function listedBooks(list: BookList | undefined, shelf: Book[]) {
  if (!list) return [];
  const own = shelf.filter((book) => book.lists?.includes(list.id));
  const there = new Set(own.map((book) => book.openLibrary?.work));
  const copies = booksByWork(shelf);
  const works = (list.works ?? [])
    .filter((work) => !there.has(work.workKey))
    .map((work) => copies.get(work.workKey) ?? catalogueBook(work));
  return [...own, ...works];
}

// On the reader's shelves, not one from the catalogue only
export const isOwn = (book: Book) => !workOfBook(book);
