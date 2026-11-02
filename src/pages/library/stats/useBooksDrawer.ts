import { useState } from 'react';
import type { Book } from '@/entities/book/types';

// Which group's books are open in the drawer (BooksDrawer), if any: the
// one last opened kept as the drawer goes, so it doesn't empty on its way
// down
export function useBooksDrawer() {
  const [opened, setOpened] = useState(false);
  const [shown, setShown] = useState<{ title: string; books: Book[] }>({
    title: '',
    books: [],
  });
  return {
    open: opened,
    ...shown,
    show: (title: string, books: Book[]) => {
      setShown({ title, books });
      setOpened(true);
    },
    onClose: () => setOpened(false),
  };
}
