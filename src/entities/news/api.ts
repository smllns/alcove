import { request } from '@/shared/api/http';
import type { News, NewsInput } from './types';

export const fetchNews = async () =>
  (await request<{ news: News[] }>('/news')).news;

export const publishNews = async (input: NewsInput) =>
  (await request<{ news: News }>('/news', { method: 'POST', body: input }))
    .news;

export const rewriteNews = async (id: string, input: NewsInput) =>
  (
    await request<{ news: News }>(`/news/${id}`, {
      method: 'PUT',
      body: input,
    })
  ).news;

export const unpublishNews = (id: string) =>
  request<void>(`/news/${id}`, { method: 'DELETE' });
