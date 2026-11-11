import { useState } from 'react';
import type { Book } from '@/entities/book/types';

// A page of the group's own, to go on to from its books (an author's)
export type GroupPage = { to: string; label: string };

// Which group's books are open in the drawer (BooksDrawer), if any: the
// one last opened kept as the drawer goes, so it doesn't empty on its way
// down
export function useBooksDrawer() {
  const [opened, setOpened] = useState(false);
  const [shown, setShown] = useState<{
    title: string;
    books: Book[];
    page?: GroupPage;
  }>({
    title: '',
    books: [],
  });
  return {
    open: opened,
    ...shown,
    show: (title: string, books: Book[], page?: GroupPage) => {
      setShown({ title, books, page });
      setOpened(true);
    },
    onClose: () => setOpened(false),
  };
}
