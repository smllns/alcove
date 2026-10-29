import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { catalogueBook } from '@/entities/book/catalogueBook';
import type { Book, CatalogueWork } from '@/entities/book/types';
import { freshListName } from '@/entities/list/names';
import { useCreateList } from '@/entities/list/queries';
import type { BookList } from '@/entities/list/types';
import { paths } from '@/shared/config/paths';
import type { SamePage } from '@/shared/lib/pageScroll';
import type { ListChanges } from './useListChanges';

// The list a list's page is of (`id` its address's): one of the reader's,
// or one only being begun (at paths.newList), under a name of its own for
// now and kept nowhere. That one's made (`make`) once something's done in
// it, its name typed or a book put in, and its page's address becomes its
// own, the page staying as it is; left before then, it was never made.
// Books put in it before it's made wait with it (`early`, useBegunBooks),
// and whether it's to be public, public unless chosen otherwise (`open`).
export function useListBeing(id: string, lists: BookList[] | undefined) {
  const begun = paths.list(id) === paths.newList;
  const create = useCreateList();
  const [early, setEarly] = useState<Early[]>([]);
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();
  const name = freshListName((lists ?? []).map((list) => list.name));
  const list = begun
    ? lists && { id: '', name, public: open }
    : lists?.find((each) => each.id === id);
  const make = (named = name) => {
    if (create.isPending) return;
    create.mutate(
      { name: named, public: open },
      {
        onSuccess: ({ list: made }) =>
          void navigate(paths.list(made.id), {
            replace: true,
            state: { page: paths.newList } satisfies SamePage,
          }),
      },
    );
  };
  return {
    list,
    begun,
    make,
    early,
    setEarly,
    setOpen,
    error: create.error,
  };
}

type Being = ReturnType<typeof useListBeing>;
// A book put in a list before it's made, and how it's to be put in then
type Early = { book: Book; put: (now: ListChanges) => void };

// Books put in a list: in one being begun, shown in it at once as any
// book put in is, and put in for good, quietly, once it's made, so the
// first doesn't wait on the making
export function useBegunBooks(being: Being, changes: ListChanges) {
  const { early, setEarly } = being;
  const made = being.list?.id;
  useEffect(() => {
    if (!made || !early.length) return;
    for (const each of early) each.put(changes);
    setEarly([]);
    // Once, as it's made, with what's put in it by then
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [made]);
  const add = (book: Book, put: (now: ListChanges) => void) => {
    changes.show([book.id], () => setEarly((now) => [...now, { book, put }]));
    being.make();
  };
  return {
    putIn: (book: Book) =>
      being.begun
        ? add(book, (now) => now.putIn(book, true))
        : changes.putIn(book),
    putWork: (work: CatalogueWork) =>
      being.begun
        ? add(catalogueBook(work), (now) => now.putWork(work, true))
        : changes.putWork(work),
  };
}
