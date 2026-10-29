import { request, requestBlob } from '@/shared/api/http';
import type {
  AuthorFound,
  Book,
  BookInput,
  CatalogueAuthor,
  CatalogueEdition,
  CatalogueRatings,
  CatalogueWork,
  FeaturedBooks,
  FeaturedHolding,
  FeaturedList,
  ReadersList,
  ReadersListPage,
  SimilarBook,
} from './types';

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

// The reader's books by a writer
export const fetchBooksByWriter = async (name: string) =>
  (
    await request<{ books: Book[] }>(
      `/books/by-writer?${new URLSearchParams({ name })}`,
    )
  ).books;

export const fetchBook = async (id: string) =>
  (await request<{ book: Book }>(`/books/${id}`)).book;

// Everything about the book replaced by `input`
export const updateBook = async (id: string, input: BookInput) =>
  (
    await request<{ book: Book }>(`/books/${id}`, {
      method: 'PUT',
      body: input,
    })
  ).book;

export const deleteBook = (id: string) =>
  request<void>(`/books/${id}`, { method: 'DELETE' });

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

// A work from the catalogue in short, by its key
export const fetchWorkSummary = async (workKey: string) =>
  (await request<{ work: CatalogueWork }>(`/lookup/works/${workKey}/summary`))
    .work;

// The reader's own copy of a work, if they have one
export const fetchOwnedWork = async (workKey: string) =>
  (await request<{ bookId: string | null }>(`/books/by-work/${workKey}`))
    .bookId;

export const searchCatalogue = (query: string) =>
  request<{ results: CatalogueWork[]; isbnEdition: CatalogueEdition | null }>(
    `/lookup/search?q=${encodeURIComponent(query)}`,
  );

export const searchAuthors = async (query: string) =>
  (
    await request<{ authors: AuthorFound[] }>(
      `/lookup/authors?q=${encodeURIComponent(query)}`,
    )
  ).authors;

export const fetchEditions = async (workKey: string) =>
  (
    await request<{ editions: CatalogueEdition[] }>(
      `/lookup/works/${workKey}/editions`,
    )
  ).editions;

// What the book is about, as the catalogue describes it (null if it
// doesn't), and the genres its subjects point to
export const fetchWorkDetails = (workKey: string) =>
  request<{ description: string | null; genres: string[] }>(
    `/lookup/works/${workKey}`,
  );

// How the catalogue's readers rate the book; null if none have
export const fetchWorkRatings = async (workKey: string) =>
  (
    await request<{ ratings: CatalogueRatings | null }>(
      `/lookup/works/${workKey}/ratings`,
    )
  ).ratings;

// Who wrote the book; null if the catalogue doesn't say
export const fetchWorkAuthor = async (workKey: string) =>
  (
    await request<{ author: CatalogueAuthor | null }>(
      `/lookup/works/${workKey}/author`,
    )
  ).author;

// Books to read next: on the same themes, and by the same author
export const fetchSimilarBooks = (workKey: string) =>
  request<{ alike: SimilarBook[]; byAuthor: SimilarBook[] }>(
    `/lookup/works/${workKey}/similar`,
  );

// Lists readers have made on Open Library that hold the book: the most
// popular few
export const fetchWorkLists = (workKey: string) =>
  request<{ lists: ReadersList[] }>(`/lookup/works/${workKey}/lists`);

// Lines from the book, gathered on Wikiquote, and the page they're from
export const fetchBookQuotes = (title: string, author: string) =>
  request<{ quotes: string[]; source: string | null }>(
    `/lookup/quotes?${new URLSearchParams({ title, author })}`,
  );

// `image` is a data URL, already shrunk in the browser
export const uploadCover = async (image: string) =>
  (
    await request<{ url: string }>('/uploads/cover', {
      method: 'POST',
      body: { image },
    })
  ).url;

// The picture at a link someone found, fetched by the server (sites rarely
// let the browser read their images), to be shrunk and uploaded like a photo
export const fetchCoverFromLink = (url: string) =>
  requestBlob('/uploads/cover/fetch', { method: 'POST', body: { url } });

// An uploaded photo the form no longer uses
export const discardCover = (url: string) =>
  request<void>('/uploads/cover/discard', { method: 'POST', body: { url } });

export const fetchUploadsEnabled = async () =>
  (await request<{ enabled: boolean }>('/uploads/status')).enabled;
