import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from '@tanstack/react-query';
import { isReadersOwn, readersOwnId } from '@/entities/book/catalogueBook';
import {
  answerAsking,
  fetchAsking,
  fetchPeople,
  fetchReader,
  fetchReaderBook,
  fetchFeed,
  markFeedSeen,
  setFollowing,
} from './api';
import { readerKeys } from './keys';
import type { Feed, ReaderPage } from './types';

// A reader's page, as far as the one looking may see it
export const useReader = (username: string | undefined) =>
  useQuery({
    queryKey: readerKeys.page(username ?? ''),
    queryFn: () => fetchReader(username!),
    enabled: Boolean(username),
    staleTime: 60 * 1000,
  });

// The reader's own page as they've just changed who they are (their name,
// what they say of themselves, their photo, who sees what): shown so at
// once, wherever it's kept, then asked for afresh behind it
export function showOwnChanges(
  client: QueryClient,
  own: Pick<ReaderPage, 'username' | 'name' | 'about' | 'avatarUrl'> &
    Required<Pick<ReaderPage, 'privacy'>>,
) {
  client.setQueryData<ReaderPage>(
    readerKeys.page(own.username),
    (page) =>
      page && {
        ...page,
        name: own.name,
        about: own.about,
        avatarUrl: own.avatarUrl,
        privacy: own.privacy,
      },
  );
  void client.invalidateQueries({ queryKey: ['reader'] });
}

// Another reader's book the catalogue doesn't know (book-…), as alcove has
// it from their shelves
export const useReaderBook = (workKey: string) =>
  useQuery({
    queryKey: ['reader-book', workKey],
    queryFn: () => fetchReaderBook(readersOwnId(workKey)),
    enabled: isReadersOwn(workKey),
    staleTime: 5 * 60 * 1000,
  });

// Following them, or no longer: said on their page at once, and the page
// asked for afresh, as following may open more of it
export function useFollow(username: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (on: boolean) => setFollowing(username, on),
    onSuccess: (follow) => {
      client.setQueryData<ReaderPage>(
        readerKeys.page(username),
        (page) =>
          page && {
            ...page,
            follow,
            counts: {
              ...page.counts,
              followers:
                page.counts.followers +
                (follow === 'following' ? 1 : 0) -
                (page.follow === 'following' ? 1 : 0),
            },
          },
      );
      void client.invalidateQueries({ queryKey: ['reader'] });
    },
  });
}

// Who follow a reader, or who they follow, once that's to be shown
export const usePeople = (
  username: string,
  side: 'followers' | 'following',
  enabled: boolean,
) =>
  useQuery({
    queryKey: readerKeys.people(username, side),
    queryFn: () => fetchPeople(username, side),
    enabled,
    staleTime: 60 * 1000,
  });

// Those asking to follow the reader, on their own page
export const useAsking = (enabled: boolean) =>
  useQuery({
    queryKey: readerKeys.asking,
    queryFn: fetchAsking,
    enabled,
  });

// One of them let in or turned away; the reader's page and the askers
// asked for afresh
export function useAnswer() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ username, yes }: { username: string; yes: boolean }) =>
      answerAsking(username, yes),
    onSuccess: (_done, { username, yes }) => {
      void client.invalidateQueries({ queryKey: readerKeys.asking });
      void client.invalidateQueries({ queryKey: ['reader'] });
      // In the feed, their request now a follow, or gone
      client.setQueryData<Feed>(
        readerKeys.feed,
        (feed) =>
          feed && {
            ...feed,
            items: feed.items.flatMap((item) =>
              item.kind === 'asked' && item.reader.username === username
                ? yes
                  ? [{ ...item, kind: 'followed' as const }]
                  : []
                : [item],
            ),
          },
      );
    },
  });
}

// The reader's feed, asked for afresh every minute or so it's looked at
export const useFeed = () =>
  useQuery({
    queryKey: readerKeys.feed,
    queryFn: fetchFeed,
    staleTime: 60 * 1000,
  });

// The feed looked at: nothing new in it any more, at once
export function useMarkFeedSeen() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: markFeedSeen,
    onMutate: () =>
      client.setQueryData<Feed>(
        readerKeys.feed,
        (feed) => feed && { ...feed, unread: 0 },
      ),
  });
}
