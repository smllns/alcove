import { useMemo } from 'react';
import { useBooks } from './queries';
import { useShelf } from './useShelf';
import { namesWriter } from './writers';

// The reader's books by a writer, newest first, however each writes their
// name ("Leopold von Sacher-Masoch", "Леопольд фон Захер-Мазох"), and
// whether that's known yet (`known`): once all the shelves are in
export function useWriterBooks(name: string | undefined) {
  const shelf = useShelf(useBooks(), '', true);
  const books = useMemo(
    () => (name ? shelf.all.filter((book) => namesWriter(book, name)) : []),
    [shelf.all, name],
  );
  return { books, known: shelf.complete };
}
