import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { PlaceRef } from '@/entities/place/types';
import { updateBook } from './api';
import { bookKeys, onShelf, recount } from './queries';
import type { Book } from './types';

// Books put somewhere else in the places, each `to` its own place: moved
// on the shelf at once, the server told after
export function useMoveBooks() {
  const client = useQueryClient();
  return useMutation({
    mutationKey: ['books', 'move'],
    mutationFn: (moves: { book: Book; to?: PlaceRef; at: string }[]) =>
      Promise.all(
        moves.map(({ book, to, at }) =>
          updateBook(book.id, {
            ...book,
            copy: { status: 'shelf', ...book.copy, place: to, placedAt: at },
          }),
        ),
      ),
    onMutate: (moves) => {
      // No answer to an earlier ask coming back over this
      void client.cancelQueries({ queryKey: bookKeys.shelf });
      const moved = new Map(moves.map((move) => [move.book.id, move]));
      onShelf(client, (page) => ({
        ...page,
        books: page.books.map((book) => {
          const move = moved.get(book.id);
          return move
            ? {
                ...book,
                copy: {
                  status: 'shelf',
                  ...book.copy,
                  place: move.to,
                  placedAt: move.at,
                },
              }
            : book;
        }),
      }));
    },
    // Asked afresh once the last of a run of moves (one undone, say) is
    // done: asked between them, the answer would put a book back where
    // it was a moment ago, and then where it is, a jump each way
    onSettled: () => {
      if (client.isMutating({ mutationKey: ['books', 'move'] }) > 1) return;
      void client.invalidateQueries({ queryKey: bookKeys.all });
      recount(client);
    },
  });
}

// Books put somewhere together, each a moment after the one before, so
// they stand in the order they're given (useMoveBooks)
export const movesTo = (
  books: Book[],
  to: (book: Book) => PlaceRef | undefined,
) => {
  const now = Date.now();
  return books.map((book, i) => ({
    book,
    to: to(book),
    at: new Date(now + i).toISOString(),
  }));
};
