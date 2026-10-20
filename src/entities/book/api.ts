import { request, requestBlob } from '@/shared/api/http';
import type { Book, BookInput, CatalogueEdition, CatalogueWork } from './types';

export type BooksPage = {
  books: Book[];
  nextCursor: string | null;
  total: number;
};

// A page of the reader's books
export function fetchBooks(after: string | null) {
  const params = new URLSearchParams({ limit: '48' });
  if (after) params.set('after', after);
  return request<BooksPage>(`/books?${params}`);
}

export const addBook = async (input: BookInput) =>
  (await request<{ book: Book }>('/books', { method: 'POST', body: input }))
    .book;

export const deleteBook = (id: string) =>
  request<void>(`/books/${id}`, { method: 'DELETE' });

export const searchCatalogue = (query: string) =>
  request<{ results: CatalogueWork[]; isbnEdition: CatalogueEdition | null }>(
    `/lookup/search?q=${encodeURIComponent(query)}`,
  );

export const fetchEditions = async (workKey: string) =>
  (
    await request<{ editions: CatalogueEdition[] }>(
      `/lookup/works/${workKey}/editions`,
    )
  ).editions;

// `image` is a data URL, already shrunk in the browser
export const uploadCover = async (image: string) =>
  (
    await request<{ url: string }>('/uploads/cover', {
      method: 'POST',
      body: { image },
    })
  ).url;

// Copies a few more catalogue covers into our own storage, where they load
// quickly; how many are still to go
export const copyCatalogueCovers = () =>
  request<{ remaining: number }>('/books/covers/copy', { method: 'POST' });

// The picture at a link someone found, fetched by the server (sites rarely
// let the browser read their images), to be shrunk and uploaded like a photo
export const fetchCoverFromLink = (url: string) =>
  requestBlob('/uploads/cover/fetch', { method: 'POST', body: { url } });

// An uploaded photo the form no longer uses
export const discardCover = (url: string) =>
  request<void>('/uploads/cover/discard', { method: 'POST', body: { url } });

export const fetchUploadsEnabled = async () =>
  (await request<{ enabled: boolean }>('/uploads/status')).enabled;
