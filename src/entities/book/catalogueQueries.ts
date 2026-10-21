import { useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import {
  fetchBookQuotes,
  fetchEditions,
  fetchWorkDetails,
  fetchWorkRatings,
  searchCatalogue,
} from './api';

// What's asked of the book catalogues (Open Library, Wikiquote) about books
// in general, rather than the reader's own: finding a book, its editions,
// what it's about, how it's rated, lines from it

const catalogueKeys = {
  search: (query: string) => ['catalogue', 'search', query] as const,
  editions: (workKey: string) => ['catalogue', 'editions', workKey] as const,
  about: (workKey: string) => ['catalogue', 'about2', workKey] as const,
  ratings: (workKey: string) => ['catalogue', 'ratings', workKey] as const,
  quotes: (title: string, author: string) =>
    ['catalogue', 'quotes', title, author] as const,
};

// Keeps showing the last results while the next query loads, so the list
// doesn't flash empty between keystrokes
export const useCatalogueSearch = (query: string) =>
  useQuery({
    queryKey: catalogueKeys.search(query),
    queryFn: () => searchCatalogue(query),
    enabled: query.length >= 2,
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
  });

export const useEditions = (workKey: string | undefined) =>
  useQuery({
    queryKey: catalogueKeys.editions(workKey ?? ''),
    queryFn: () => fetchEditions(workKey!),
    enabled: Boolean(workKey),
    staleTime: 30 * 60 * 1000,
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
