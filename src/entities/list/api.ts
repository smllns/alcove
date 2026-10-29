import { request } from '@/shared/api/http';
import type {
  BookList,
  ListedWork,
  Lists,
  SavedList,
  SharedList,
  SharedListBooks,
} from './types';

export const fetchLists = () => request<Lists>('/lists');

// A new list, public unless said otherwise; one by that name already is
// given back instead
export const createList = (list: { name: string; public?: boolean }) =>
  request<Lists & { list: BookList }>('/lists', {
    method: 'POST',
    body: list,
  });

// A list renamed, or made public or private
export type ListChange = { id: string; name?: string; public?: boolean };

// Every list, as they are once one's changed or gone
export const changeList = ({ id, ...change }: ListChange) =>
  request<Lists>(`/lists/${id}`, { method: 'PATCH', body: change });

export const deleteList = (id: string) =>
  request<Lists>(`/lists/${id}`, { method: 'DELETE' });

// Books from the catalogue put in a list, and taken out of it (by work)
export type WorksChange = {
  id: string;
  add?: ListedWork[];
  remove?: string[];
};

export const changeListWorks = ({ id, add = [], remove = [] }: WorksChange) =>
  request<Lists>(`/lists/${id}/works`, {
    method: 'PATCH',
    body: { add, remove },
  });

// Other readers' public lists with `query` in their names
export const searchSharedLists = async (query: string) =>
  (
    await request<{ lists: SharedList[] }>(
      `/lists/shared?q=${encodeURIComponent(query)}`,
    )
  ).lists;

export const fetchSharedList = async (id: string) =>
  (await request<{ list: SharedListBooks }>(`/lists/shared/${id}`)).list;

// Other readers' lists kept, the last kept first; one kept, one let go
export const fetchSaved = async () =>
  (await request<{ saved: SavedList[] }>('/lists/saved')).saved;
export const saveList = async (list: SavedList) =>
  (
    await request<{ saved: SavedList[] }>('/lists/saved', {
      method: 'PUT',
      body: list,
    })
  ).saved;
export const unsaveList = async ({ kind, ref }: SavedList) =>
  (
    await request<{ saved: SavedList[] }>(
      `/lists/saved?${new URLSearchParams({ kind, ref })}`,
      { method: 'DELETE' },
    )
  ).saved;
