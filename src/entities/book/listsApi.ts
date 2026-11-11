import { request } from '@/shared/api/http';
import type {
  FeaturedBooks,
  FeaturedHolding,
  FeaturedList,
  ReadersList,
  ReadersListPage,
} from './types';

// The lists every reader sees, and one of them with its books
export const fetchFeaturedLists = async () =>
  (await request<{ lists: FeaturedList[] }>('/lookup/featured')).lists;
export const fetchFeaturedList = async (id: string) =>
  (await request<{ list: FeaturedBooks }>(`/lookup/featured/${id}`)).list;

// Lists readers have made on Open Library, by name; and a page of one's
// books (from 0)
export const searchReadersLists = async (query: string) =>
  (
    await request<{ lists: ReadersList[] }>(
      `/lookup/lists?q=${encodeURIComponent(query)}`,
    )
  ).lists;
// Whether one of them can be shown here: how many books it holds, or 0
export const checkReadersList = (owner: string, id: string) =>
  request<{ books: number }>(`/lookup/lists/${owner}/${id}/check`);
export const fetchReadersList = async (
  owner: string,
  id: string,
  page: number,
) =>
  (
    await request<{ list: ReadersListPage }>(
      `/lookup/lists/${owner}/${id}?page=${page}`,
    )
  ).list;

// The lists every reader sees that a work is in
export const fetchWorkFeatured = async (workKey: string) =>
  (
    await request<{ lists: FeaturedHolding[] }>(
      `/lookup/works/${workKey}/featured`,
    )
  ).lists;

// How the catalogue's readers rate `works`, out of five (none known, null)
export const fetchAverages = async (works: string[]) =>
  (
    await request<{ averages: Record<string, number | null> }>(
      `/lookup/averages?works=${works.join(',')}`,
    )
  ).averages;
