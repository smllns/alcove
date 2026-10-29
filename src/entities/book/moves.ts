import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { PlaceRef } from '@/entities/place/types';
import { updateBook } from './api';
import { bookKeys, onShelf, recount } from './queries';
import type { Book } from './types';

// Books changed together, each given as it's to be (moved in the places,
// say, or taken out of a list): changed on the shelf at once, the server
// told after. Runs of the same `kind` share the one refetch.
export function useChangeBooks(kind: string) {
  const client = useQueryClient();
  const mutationKey = ['books', kind];
  return useMutation({
    mutationKey,
    mutationFn: (books: Book[]) =>
      Promise.all(books.map((book) => updateBook(book.id, book))),
    onMutate: (books) => {
      // No answer to an earlier ask coming back over this
      void client.cancelQueries({ queryKey: bookKeys.shelf });
      const changed = new Map(books.map((book) => [book.id, book]));
      onShelf(client, (page) => ({
        ...page,
        books: page.books.map((book) => changed.get(book.id) ?? book),
      }));
    },
    // Asked afresh once the last of a run of changes (one undone, say) is
    // done: asked between them, the answer would put a book back as it
    // was a moment ago, and then as it is, a jump each way
    onSettled: () => {
      if (client.isMutating({ mutationKey }) > 1) return;
      void client.invalidateQueries({ queryKey: bookKeys.all });
      recount(client);
    },
  });
}

// Books put somewhere else in the places, each `to` its own place
export const useMoveBooks = () => useChangeBooks('move');

// Books put somewhere together, each a moment after the one before, so
// they stand in the order they're given (useMoveBooks)
export const movesTo = (
  books: Book[],
  to: (book: Book) => PlaceRef | undefined,
): Book[] => {
  const now = Date.now();
  return books.map((book, i) => ({
    ...book,
    copy: {
      status: 'shelf',
      ...book.copy,
      place: to(book),
      placedAt: new Date(now + i).toISOString(),
    },
  }));
};
