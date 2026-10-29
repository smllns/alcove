import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { keepWhileTyping } from '@/shared/lib/keepWhileTyping';
import { searchable } from './matches';
import {
  fetchBookQuotes,
  fetchEditions,
  fetchSimilarBooks,
  fetchWorkAuthor,
  fetchWorkDetails,
  fetchWorkRatings,
  fetchWorkSummary,
  searchAuthors,
  searchCatalogue,
} from './api';
import type { CatalogueAuthor, CatalogueWork } from './types';

// What's asked of the book catalogues (Open Library, Wikiquote) about books
// in general, rather than the reader's own: finding a book, its editions,
// what it's about, how it's rated, lines from it, who wrote it, books like
// it (and the lists of books, catalogueListQueries)

const catalogueKeys = {
  search: (query: string) => ['catalogue', 'search', query] as const,
  authors: (query: string) => ['catalogue', 'authors', query] as const,
  editions: (workKey: string) => ['catalogue', 'editions', workKey] as const,
  about: (workKey: string) => ['catalogue', 'about2', workKey] as const,
  ratings: (workKey: string) => ['catalogue', 'ratings', workKey] as const,
  similar: (workKey: string) => ['catalogue', 'similar', workKey] as const,
  author: (workKey: string) => ['catalogue', 'author', workKey] as const,
  quotes: (title: string, author: string) =>
    ['catalogue', 'quotes', title, author] as const,
};

// Keeps showing the last results while the next query loads, so the list
// doesn't flash empty between keystrokes; not after the field's cleared
export const useCatalogueSearch = (query: string) =>
  useQuery({
    queryKey: catalogueKeys.search(query),
    queryFn: () => searchCatalogue(query),
    enabled: query.length >= 2,
    placeholderData: keepWhileTyping(query),
    staleTime: 5 * 60 * 1000,
  });

// Writers by name, the last found kept showing while typing, as above
export const useAuthorSearch = (query: string) =>
  useQuery({
    queryKey: catalogueKeys.authors(query),
    queryFn: () => searchAuthors(query),
    enabled: query.length >= 2,
    placeholderData: keepWhileTyping(query),
    staleTime: 5 * 60 * 1000,
  });

export const useEditions = (workKey: string | undefined) =>
  useQuery({
    queryKey: catalogueKeys.editions(workKey ?? ''),
    queryFn: () => fetchEditions(workKey!),
    enabled: Boolean(workKey),
    staleTime: 30 * 60 * 1000,
  });

// A work in short, for its page: there at once when the page before had it
// (`known`), asked for when the page is opened straight from its address
export const useWorkSummary = (workKey: string, known?: CatalogueWork) =>
  useQuery({
    queryKey: ['catalogue', 'work', workKey],
    queryFn: () => fetchWorkSummary(workKey),
    initialData: known?.workKey === workKey ? known : undefined,
    staleTime: Infinity,
  });

// What the catalogue says the book is about, and its genres. Asked once
// per book: it doesn't change.
const workDetailsQuery = (workKey: string) => ({
  queryKey: catalogueKeys.about(workKey),
  queryFn: () => fetchWorkDetails(workKey),
  staleTime: Infinity,
});

export const useWorkDetails = (workKey: string | undefined) =>
  useQuery({
    ...workDetailsQuery(workKey ?? ''),
    enabled: Boolean(workKey),
  });

export const useWorkRatings = (workKey: string | undefined) =>
  useQuery({
    queryKey: catalogueKeys.ratings(workKey ?? ''),
    queryFn: () => fetchWorkRatings(workKey!),
    enabled: Boolean(workKey),
    staleTime: 60 * 60 * 1000,
  });

// A writer's name as names are matched: no case, accents, spaces or dots,
// so "J. R. R. Tolkien" is "J.R.R. Tolkien"
const nameKey = (name: string) => [
  'catalogue',
  'author-by-name',
  searchable(name).replace(/[^\p{L}\p{N}]/gu, ''),
];

// Who wrote the book, asked once per book: it hardly changes. Kept by the
// writer's name too (theirs as the book has it, and as the catalogue does),
// so another book of theirs opened next shows them at once, while its own
// answer is asked for (in case the catalogue tells it differently)
export function useWorkAuthor(workKey: string | undefined, name?: string) {
  const client = useQueryClient();
  const query = useQuery({
    queryKey: catalogueKeys.author(workKey ?? ''),
    queryFn: () => fetchWorkAuthor(workKey!),
    enabled: Boolean(workKey),
    staleTime: Infinity,
    placeholderData: () =>
      name ? client.getQueryData<CatalogueAuthor>(nameKey(name)) : undefined,
  });
  // Remembered by name whenever it's known, asked now or long ago
  const author = query.isPlaceholderData ? undefined : query.data;
  useEffect(() => {
    if (!author) return;
    for (const each of [name, author.name])
      if (each) client.setQueryData(nameKey(each), author);
  }, [author, name, client]);
  return query;
}

// Books to read next. Asked again each time the page opens (the server
// keeps the catalogue's answer), so those added since show as on the
// shelves.
export const useSimilarBooks = (workKey: string | undefined) =>
  useQuery({
    queryKey: catalogueKeys.similar(workKey ?? ''),
    queryFn: () => fetchSimilarBooks(workKey!),
    enabled: Boolean(workKey),
  });

// Lines from the book to offer the reader; they hardly change
export const useBookQuotes = (title: string, author = '') =>
  useQuery({
    queryKey: catalogueKeys.quotes(title, author),
    queryFn: () => fetchBookQuotes(title, author),
    staleTime: 24 * 60 * 60 * 1000,
  });

// What the catalogue says a book is about, fetched only when asked for
// (`load`, which hands it over): `known` is undefined until asked, then
// the description or null if there's none. `loading` while it's asked;
// `failed` if the catalogue didn't answer.
export function useCatalogueDescription(workKey: string | undefined) {
  const query = useQuery({
    ...workDetailsQuery(workKey ?? ''),
    enabled: false,
  });
  const [asked, setAsked] = useState(false);
  const known = query.data?.description;
  return {
    known,
    // Worth offering while the catalogue may yet say
    available: Boolean(workKey) && known !== null,
    loading: query.isFetching,
    // Asked, and there's none
    missing: asked && known === null,
    failed: asked && query.isError,
    load: async () => {
      setAsked(true);
      return (await query.refetch()).data?.description ?? undefined;
    },
  };
}

// The words for asking the catalogue for a description, as it's asked
export const loadDescriptionLabel = (loading: boolean) =>
  loading ? 'Asking Open Library…' : 'Load from Open Library';
