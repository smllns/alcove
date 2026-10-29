import { useRef } from 'react';
import { useChangeBooks } from '@/entities/book/moves';
import type { Book, CatalogueWork } from '@/entities/book/types';
import { catalogueBook } from '@/entities/book/catalogueBook';
import type { WorksChange } from '@/entities/list/api';
import { useChangeListWorks } from '@/entities/list/queries';
import type { BookList } from '@/entities/list/types';
import { useBookMoves } from '../places/shelf/useBookMoves';

const lists = (book: Book) => book.lists ?? [];

// Books put in a list and taken out of it, as they're shown (`shown`, in
// the grid held by `frame`): those taken out fade where they stand, those
// put in fade in, and the rest glide over, as in the places, each change
// saved as it's shown. The reader's own books say which lists they're in;
// those from the catalogue are kept in the list itself. Put in `quietly`,
// a book shown in it already (put in a list being begun, ListPage) is
// only saved.
export function useListChanges(list: BookList | undefined, shown: Book[]) {
  const frame = useRef<HTMLDivElement>(null);
  const motion = useBookMoves(frame, shown.map((book) => book.id).join());
  const changeBooks = useChangeBooks('list');
  const changeWorks = useChangeListWorks();

  // The books `ids` going or coming: the reader's own as they're to be
  // (`own`), and those from the catalogue put in or taken out (`works`)
  const send = (
    ids: string[],
    own: Book[],
    works: Omit<WorksChange, 'id'>,
    quietly = false,
  ) => {
    if (!list) return;
    const save = () => {
      if (own.length) changeBooks.mutate(own);
      if (works.add?.length || works.remove?.length)
        changeWorks.mutate({ id: list.id, ...works });
    };
    if (quietly) save();
    else motion.move(ids, save);
  };

  return {
    frame,
    // Books shown coming in or going as `apply` changes what's shown
    show: motion.move,
    putIn: (book: Book, quietly = false) =>
      list &&
      send(
        [book.id],
        [{ ...book, lists: [...lists(book), list.id] }],
        {},
        quietly,
      ),
    putWork: (work: CatalogueWork, quietly = false) =>
      send([catalogueBook(work).id], [], { add: [work] }, quietly),
    // Taken out together, giving the way to put them back as they were
    takeOut: (picked: Book[]) => {
      if (!list) return () => {};
      const ids = picked.map((book) => book.id);
      const own = picked.filter((book) => lists(book).includes(list.id));
      const keys = new Set(picked.map((book) => book.openLibrary?.work));
      const works = (list.works ?? []).filter((work) => keys.has(work.workKey));
      send(
        ids,
        own.map((book) => ({
          ...book,
          lists: lists(book).filter((id) => id !== list.id),
        })),
        { remove: works.map((work) => work.workKey) },
      );
      return () => void send(ids, own, { add: works });
    },
  };
}

export type ListChanges = ReturnType<typeof useListChanges>;
