import { useEffect } from 'react';
import {
  useQueries,
  useQuery,
  useQueryClient,
  type QueryClient,
} from '@tanstack/react-query';
import { settled } from '@/shared/lib/settled';
import {
  fetchAuthorWorks,
  fetchWorkTitles,
  fetchWriterQuotes,
} from './authorApi';
import { fetchAuthor } from './api';
import { authorAskOf, type AuthorAsk } from './authorAsk';
import { searchable } from './matches';
import { sameWritersKey } from './sameWriters';
import type { Book, CatalogueAuthor } from './types';

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

// Who wrote a book, as it was asked about
const authorKey = ({ work, name, title, read, original }: AuthorAsk) =>
  [
    'catalogue',
    'author4',
    work ?? `${name}|${title}`,
    read ?? '',
    original ?? '',
  ] as const;

// A writer's name as names are matched: no case, accents, spaces or dots,
// so "J. R. R. Tolkien" is "J.R.R. Tolkien"
const nameKey = (name: string) => [
  'catalogue',
  'author-by-name',
  searchable(name).replace(/[^\p{L}\p{N}]/gu, ''),
];

// Who wrote a book, as asked by it (useBookAuthor, and a writer's page,
// which asks by a few of their books)
export const authorQuery = (ask: AuthorAsk) => ({
  queryKey: authorKey(ask),
  queryFn: async ({ client }: { client: QueryClient }) => {
    const { author, moreNames } = await fetchAuthor(ask);
    // More of their names known: who's one asked afresh
    if (moreNames) void client.invalidateQueries({ queryKey: sameWritersKey });
    return author;
  },
  enabled: Boolean(ask.work || ask.name),
  staleTime: Infinity,
});

// Who wrote the book, asked once per book: it hardly changes. Kept by the
// writer's name too (theirs as the book has it, and as the catalogue does),
// so another book of theirs opened next shows them at once, while its own
// answer is asked for (in case the catalogue tells it differently)
export function useBookAuthor(ask: AuthorAsk) {
  const { name } = ask;
  const client = useQueryClient();
  const query = useQuery({
    ...authorQuery(ask),
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
