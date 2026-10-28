import { useMemo } from 'react';
import {
  useAuthorSearch,
  useCatalogueSearch,
} from '@/entities/book/catalogueQueries';
import { useBooks } from '@/entities/book/queries';
import { useShelf } from '@/entities/book/useShelf';
import { useReaderSearch } from '@/entities/user/queries';

export type SearchKind = 'all' | 'books' | 'people' | 'authors';

// Everything `query` finds, of the `kind` looked for: the reader's own
// books (searched right here), every book in the catalogue, other readers
// and writers. Starting with @, only readers are looked for. Each part
// asks only when it's wanted, and only once there's enough typed to look
// for (`asked`: two letters, or one after @). `pending`: what's typed
// hasn't been looked for yet (it's still being typed), so every part
// counts as loading, the last found kept showing meanwhile.
export function useSearch(query: string, kind: SearchKind, pending: boolean) {
  const readersOnly = query.startsWith('@');
  const asked = query.replace(/^@/, '').length >= (readersOnly ? 1 : 2);
  const wants = (part: SearchKind) =>
    asked &&
    (readersOnly ? part === 'people' : kind === 'all' || kind === part);
  const bookQuery = wants('books') ? query : '';

  const shelf = useShelf(useBooks(Boolean(bookQuery)), bookQuery, false);
  const catalogue = useCatalogueSearch(bookQuery);
  const readers = useReaderSearch(wants('people') ? query : '');
  const authors = useAuthorSearch(wants('authors') ? query : '');

  // The reader's own copy of a book the catalogue found, by its work
  const owned = useMemo(
    () =>
      new Map(
        shelf.all
          .filter((book) => book.openLibrary?.work)
          .map((book) => [book.openLibrary!.work!, book.id]),
      ),
    [shelf.all],
  );

  const loading = {
    own: Boolean(bookQuery) && (pending || !shelf.complete),
    works: Boolean(bookQuery) && (pending || catalogue.isFetching),
    readers: wants('people') && (pending || readers.isFetching),
    authors: wants('authors') && (pending || authors.isFetching),
  };

  return {
    readersOnly,
    asked,
    own: bookQuery ? shelf.found : [],
    works: bookQuery ? (catalogue.data?.results ?? []) : [],
    readers: wants('people') ? (readers.data ?? []) : [],
    authors: wants('authors') ? (authors.data ?? []) : [],
    owned,
    loading,
    // Anything still on its way
    looking: Object.values(loading).some(Boolean),
  };
}

export type Found = ReturnType<typeof useSearch>;
