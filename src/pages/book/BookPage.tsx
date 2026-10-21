import { Loading } from '@/shared/ui/Loading';
import { BookFrame } from './BookFrame';
import { CoverAmbience } from './CoverAmbience';
import { BookMissing } from './BookMissing';
import { BookView } from './BookView';
import { useBookPage } from './useBookPage';
import { paths } from '@/shared/config/paths';

// Everything about one book on the shelves: the cover, what it's about,
// what the reader made of it, where it lives, and the edition. Changing
// any of it is a page of its own.
export function BookPage() {
  const { book: query, editPath } = useBookPage();
  // Kept on show while it's taken off the shelves, until the page is gone
  const book = query.data;

  return (
    <BookFrame
      back={paths.library}
      wide
      // Beside the book, once there's a book to set it beside
      backBeside={Boolean(book)}
      backdrop={book && <CoverAmbience key={book.id} book={book} />}
    >
      {book ? (
        <BookView book={book} editPath={editPath} />
      ) : query.isError ? (
        <BookMissing error={query.error} />
      ) : (
        <Loading />
      )}
    </BookFrame>
  );
}
