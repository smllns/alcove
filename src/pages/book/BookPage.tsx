import { BookShell } from './BookShell';
import { BookView } from './BookView';
import { useBookPage } from './useBookPage';

// Everything about one book on the shelves: the cover, what it's about,
// what the reader made of it, where it lives, and the edition. Changing
// any of it is a page of its own.
export function BookPage() {
  const { book: query, editPath } = useBookPage();
  // Kept on show while it's taken off the shelves, until the page is gone
  const book = query.data;

  return (
    <BookShell book={book} error={query.error}>
      {book && <BookView book={book} editPath={editPath} />}
    </BookShell>
  );
}
