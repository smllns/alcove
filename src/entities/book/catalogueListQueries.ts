import { useInfiniteQuery, useQueries, useQuery } from '@tanstack/react-query';
import {
  checkReadersList,
  fetchFeaturedList,
  fetchFeaturedLists,
  fetchReadersList,
  fetchWorkFeatured,
  fetchWorkLists,
  searchReadersLists,
} from './api';
import type { ReadersList } from './types';

// What's asked of the catalogue about lists of books: those every reader
// sees, those readers have made on Open Library, and those a book is in

// The lists every reader sees under their own, and one with its books;
// what's popular changes by the day, so it's asked afresh within the hour
export const useFeaturedLists = () =>
  useQuery({
    queryKey: ['catalogue', 'featured'],
    queryFn: fetchFeaturedLists,
    staleTime: Infinity,
  });
export const useFeaturedList = (id: string) =>
  useQuery({
    queryKey: ['catalogue', 'featured', id],
    queryFn: () => fetchFeaturedList(id),
    staleTime: 60 * 60 * 1000,
  });

// The lists every reader sees that a work is in
export const useWorkFeatured = (workKey: string | undefined) =>
  useQuery({
    queryKey: ['catalogue', 'featured-with', workKey],
    queryFn: () => fetchWorkFeatured(workKey!),
    enabled: Boolean(workKey),
    staleTime: 60 * 60 * 1000,
  });

// Lists readers have made on Open Library with `query` in their names,
// once there are three letters to look for
export const useReadersLists = (query: string) =>
  useQuery({
    queryKey: ['catalogue', 'list-search', query.toLowerCase()],
    queryFn: () => searchReadersLists(query),
    enabled: query.length >= 3,
    staleTime: Infinity,
  });

// Of lists found, those whose books can be shown here, each as soon as
// it's known, in the order found; those not yet known looked into one by
// one (the server asks Open Library in turn), never again once known
export function useReadableLists(found: ReadersList[]) {
  const checks = useQueries({
    queries: found.map((list) => ({
      queryKey: ['catalogue', 'list-check', list.owner, list.id],
      queryFn: () => checkReadersList(list.owner, list.id),
      enabled: !list.readable,
      staleTime: Infinity,
      retry: false,
    })),
  });
  return {
    lists: found.flatMap((list, i) => {
      const books = list.readable ? list.books : checks[i]?.data?.books;
      return books ? [{ ...list, books }] : [];
    }),
    checking: found.some((list, i) => !list.readable && checks[i]?.isPending),
  };
}

// One of them opened, its books a page at a time, the next only once it's
// asked for (`fetchNextPage`)
export const useReadersList = (owner: string, id: string) =>
  useInfiniteQuery({
    queryKey: ['catalogue', 'list', owner, id],
    queryFn: ({ pageParam }) => fetchReadersList(owner, id, pageParam),
    initialPageParam: 0,
    getNextPageParam: (last, _, page) => (last.more ? page + 1 : undefined),
    staleTime: Infinity,
  });

// Lists on Open Library the book is in; the server keeps them for days
export const useWorkLists = (workKey: string | undefined) =>
  useQuery({
    queryKey: ['catalogue', 'work-lists', workKey ?? ''],
    queryFn: () => fetchWorkLists(workKey!),
    enabled: Boolean(workKey),
    staleTime: 60 * 60 * 1000,
  });
