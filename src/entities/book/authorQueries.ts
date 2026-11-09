import { useQueries, useQuery } from '@tanstack/react-query';
import { settled } from '@/shared/lib/settled';
import {
  fetchAuthorWorks,
  fetchWorkTitles,
  fetchWriterQuotes,
} from './authorApi';
import { authorAskOf } from './authorAsk';
import type { Book } from './types';

// A writer's books in the catalogue. Asked again each time their page
// opens (the server keeps the catalogue's answer), so those added since
// show as on the shelves.
export const useAuthorWorks = (authorKey: string | undefined) =>
  useQuery({
    queryKey: ['catalogue', 'author-works', authorKey ?? ''],
    queryFn: () => fetchAuthorWorks(authorKey!),
    enabled: Boolean(authorKey),
  });

// Words of the writer's own; they hardly change
export const useWriterQuotes = (name: string | undefined) =>
  useQuery({
    queryKey: ['catalogue', 'writer-quotes', name ?? ''],
    queryFn: () => fetchWriterQuotes(name!),
    enabled: Boolean(name),
    staleTime: 24 * 60 * 60 * 1000,
  });

// The reader's `books`' titles in every language each is known in, by
// book, and whether they're all in; they hardly change
export function useWorkTitles(books: Book[]) {
  const queries = useQueries({
    queries: books.map((book) => {
      const ask = authorAskOf(book);
      return {
        queryKey: [
          'catalogue',
          'work-titles',
          ask.title,
          ask.originalTitle ?? '',
          ask.read ?? '',
          ask.original ?? '',
        ],
        queryFn: () => fetchWorkTitles(ask),
        staleTime: 24 * 60 * 60 * 1000,
      };
    }),
  });
  return {
    titles: new Map(
      books.map((book, i) => [book.id, queries[i].data ?? []] as const),
    ),
    known: queries.every(settled),
  };
}
