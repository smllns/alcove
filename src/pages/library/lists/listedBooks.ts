import { booksByWork } from '@/entities/book/booksByWork';
import { catalogueBook, workOfBook } from '@/entities/book/catalogueBook';
import type { Book } from '@/entities/book/types';
import type { BookList } from '@/entities/list/types';

// A list's books as shown: the reader's own put in it, and those from the
// catalogue kept in it, each the reader's own copy if they've one now, the
// catalogue's otherwise, and none twice. The newest first: the reader's
// own by when they came to the shelves, the others by when they were put
// in the list; any put in before that was kept last, the latest of them
// first.
export function listedBooks(list: BookList | undefined, shelf: Book[]) {
  if (!list) return [];
  const own = shelf.filter((book) => book.lists?.includes(list.id));
  const there = new Set(own.map((book) => book.openLibrary?.work));
  const copies = booksByWork(shelf);
  const works = (list.works ?? [])
    .filter((work) => !there.has(work.workKey))
    .map((work) => copies.get(work.workKey) ?? catalogueBook(work));
  return [...own, ...works.toReversed()].toSorted((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );
}

// On the reader's shelves, not one from the catalogue only
export const isOwn = (book: Book) => !workOfBook(book);
