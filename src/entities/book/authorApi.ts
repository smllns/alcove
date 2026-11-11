import { request } from '@/shared/api/http';
import type { AuthorAsk } from './authorAsk';
import type { CatalogueWork, SimilarBook } from './types';

// What's asked about a writer for their page: their books in the
// catalogue, the most read first, with the ids of those on the reader's
// shelves; and words of their own, from Wikiquote, with the page they're
// from

export const fetchAuthorWorks = async (authorKey: string) =>
  (
    await request<{ works: SimilarBook[] }>(
      `/lookup/authors/${authorKey}/works`,
    )
  ).works;

export const fetchWriterQuotes = (name: string) =>
  request<{ quotes: string[]; source: string | null }>(
    `/lookup/writer/quotes?${new URLSearchParams({ name })}`,
  );

// A book's titles in every language it's known in, from Wikidata, by the
// titles the reader has for it and the languages it was read and written
// in (as a writer is asked for by, AuthorAsk)
export const fetchWorkTitles = async (ask: AuthorAsk) => {
  const params = new URLSearchParams();
  for (const [key, value] of [
    ['title', ask.title],
    ['original_title', ask.originalTitle],
    ['read', ask.read],
    ['original', ask.original],
  ] as const)
    if (value) params.set(key, value);
  return (await request<{ titles: string[] }>(`/lookup/work-titles?${params}`))
    .titles;
};

// A writer's books as alcove's other readers have them (users/sharedBooks.ts
// on the server)
export const fetchSharedBooksBy = async (name: string) =>
  (
    await request<{ works: CatalogueWork[] }>(
      `/users/books-by?${new URLSearchParams({ name })}`,
    )
  ).works;
