import { useQuery } from '@tanstack/react-query';
import { fetchAverages } from './listsApi';
import type { Book } from './types';

// How the catalogue's readers rate books, out of five, for ordering a list
// by it: the average a book says itself (brought over from another site,
// or as the catalogue had it when it was put in the list), or else the
// catalogue's now, asked for all of them at once and kept a while. Gives
// the books back, each with its average as far as it's known, and whether
// all there is to know is (`ready`).

// Most asked for at once, as the server takes them
const MOST = 200;

export function useAverageRatings(books: Book[]) {
  const asked = [
    ...new Set(
      books.flatMap((book) =>
        book.averageRating === undefined && book.openLibrary?.work
          ? [book.openLibrary.work]
          : [],
      ),
    ),
  ]
    .toSorted()
    .slice(0, MOST);
  const { data, isPending } = useQuery({
    queryKey: ['catalogue', 'averages', asked.join()],
    queryFn: () => fetchAverages(asked),
    enabled: asked.length > 0,
    staleTime: 60 * 60 * 1000,
  });
  return {
    ready: !asked.length || !isPending,
    books: books.map((book) => {
      const average = book.openLibrary?.work && data?.[book.openLibrary.work];
      return book.averageRating === undefined && average
        ? { ...book, averageRating: average }
        : book;
    }),
  };
}
