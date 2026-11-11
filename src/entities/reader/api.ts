import { request } from '@/shared/api/http';
import type { CatalogueWork } from '@/entities/book/types';
import type { FollowState, ListedReader, ReaderPage } from './types';

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
