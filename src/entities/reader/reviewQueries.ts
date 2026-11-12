import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchHeartsOnMine, fetchReviews, likeReview } from './api';
import { readerKeys } from './keys';
import type { ReaderReview } from './types';

// What other readers wrote of a book, kept a few minutes
export const useReviews = (book: {
  work?: string;
  title: string;
  author?: string;
}) =>
  useQuery({
    queryKey: [
      ...readerKeys.reviews,
      book.work ?? '',
      book.title,
      book.author ?? '',
    ],
    queryFn: () => fetchReviews(book),
    enabled: Boolean(book.work || book.title),
    staleTime: 5 * 60 * 1000,
  });

// A heart given or taken back: shown at once on every book page that has
// the review, as it was again if it didn't take; the reviews left in the
// order they're in (the most liked first again next time)
export function useLikeReview() {
  const client = useQueryClient();
  const hearts = (id: string, on: boolean) =>
    client.setQueriesData<ReaderReview[]>(
      { queryKey: readerKeys.reviews },
      (all) =>
        all?.map((each) =>
          each.id === id && each.liked !== on
            ? { ...each, liked: on, likes: each.likes + (on ? 1 : -1) }
            : each,
        ),
    );
  return useMutation({
    mutationFn: ({ id, on }: { id: string; on: boolean }) => likeReview(id, on),
    onMutate: ({ id, on }) => hearts(id, on),
    onError: (_err, { id, on }) => hearts(id, !on),
  });
}

// Who gave their hearts to the reader's own review, for its book's page
export const useHeartsOnMine = (bookId: string) =>
  useQuery({
    queryKey: readerKeys.hearts(bookId),
    queryFn: () => fetchHeartsOnMine(bookId),
    staleTime: 60 * 1000,
  });
