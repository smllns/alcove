import { useUpdateBook } from '@/entities/book/queries';
import type { Book, SimilarBook } from '@/entities/book/types';
import { useBriefly } from '@/shared/lib/useBriefly';

// How long the word that a book's been taken for one of the reader's
// stays, with its way to undo it
const SAID_MS = 6000;

// The reader saying a book from the catalogue is one of theirs under
// another title (a translation the catalogue keeps as a book of its own):
// kept with their book (openLibrary.also), so it's counted as theirs
// wherever it shows. What they said last stays a moment, to undo; undone,
// their book as it is now loses it again.
export function useSameBook(theirs: Book[]) {
  const update = useUpdateBook();
  const [said, setSaid] = useBriefly<{ work: SimilarBook; bookId: string }>(
    SAID_MS,
  );
  const book = theirs.find((each) => each.id === said?.bookId);

  const keep = (book: Book, also: string[]) =>
    update.mutate({
      id: book.id,
      input: { ...book, openLibrary: { ...book.openLibrary, also } },
    });
  const also = (book: Book) => book.openLibrary?.also ?? [];

  return {
    said,
    book,
    error: update.error?.message,
    say: (work: SimilarBook, book: Book) => {
      keep(book, [...new Set([...also(book), work.workKey])]);
      setSaid({ work, bookId: book.id });
    },
    undo: () => {
      if (book && said)
        keep(
          book,
          also(book).filter((key) => key !== said.work.workKey),
        );
      setSaid(null);
    },
  };
}
