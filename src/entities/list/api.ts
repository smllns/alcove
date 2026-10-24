import { request } from '@/shared/api/http';
import type { BookList, Lists } from './types';

export const fetchLists = () => request<Lists>('/lists');

// A new list; one by that name already is given back instead
export const createList = (name: string) =>
  request<Lists & { list: BookList }>('/lists', {
    method: 'POST',
    body: { name },
  });
