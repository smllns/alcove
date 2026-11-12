import { request } from '@/shared/api/http';
import type { CatalogueWork } from '@/entities/book/types';
import type {
  FollowState,
  ListedReader,
  ReaderPage,
  ReaderReview,
  Feed,
} from './types';

const at = (username: string) =>
  `/users/readers/${encodeURIComponent(username)}`;

export const fetchReader = async (username: string) =>
  (await request<{ reader: ReaderPage }>(at(username))).reader;

// One of a reader's books the catalogue doesn't know, as alcove has it
export const fetchReaderBook = async (id: string) =>
  (await request<{ work: CatalogueWork }>(`/users/books/${id}`)).work;

// Followed (or asked to be), or no longer; what that came to
export const setFollowing = async (username: string, on: boolean) =>
  (
    await request<{ follow: FollowState }>(`${at(username)}/follow`, {
      method: on ? 'POST' : 'DELETE',
    })
  ).follow;

export const fetchPeople = async (
  username: string,
  side: 'followers' | 'following',
) =>
  (await request<{ readers: ListedReader[] }>(`${at(username)}/${side}`))
    .readers;

// Those asking to follow the reader, each let in or turned away
export const fetchAsking = async () =>
  (await request<{ readers: ListedReader[] }>('/users/asking')).readers;

export const answerAsking = (username: string, yes: boolean) =>
  request<void>(`/users/asking/${encodeURIComponent(username)}`, {
    method: 'POST',
    body: { yes },
  });

// What other readers wrote of a book: by its work in the catalogue, or its
// title and writer
export const fetchReviews = async (book: {
  work?: string;
  title: string;
  author?: string;
}) =>
  (
    await request<{ reviews: ReaderReview[] }>(
      `/users/reviews?${new URLSearchParams({
        ...(book.work && { work: book.work }),
        title: book.title,
        ...(book.author && { author: book.author }),
      })}`,
    )
  ).reviews;

// A heart on another reader's review, or taken back
export const likeReview = (id: string, on: boolean) =>
  request<void>(`/users/reviews/${id}/like`, {
    method: on ? 'POST' : 'DELETE',
  });

// The reader's feed, and how much of it is new since they last looked
export const fetchFeed = () => request<Feed>('/users/feed');

// The feed looked at
export const markFeedSeen = () =>
  request<void>('/users/feed/seen', { method: 'POST' });

// Who gave their hearts to the reader's own review (kept on their copy
// `id`): how many, and the latest of them
export const fetchHeartsOnMine = (id: string) =>
  request<{ likes: number; readers: ListedReader[] }>(
    `/users/reviews/${id}/hearts`,
  );
