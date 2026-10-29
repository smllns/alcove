import { useMemo } from 'react';
import { booksByWork } from '@/entities/book/booksByWork';
import {
  useAuthorSearch,
  useCatalogueSearch,
} from '@/entities/book/catalogueQueries';
import { useBooks } from '@/entities/book/queries';
import { useShelf } from '@/entities/book/useShelf';
import { useReaderSearch } from '@/entities/user/queries';
import { useListsFound } from './useListsFound';

export type SearchKind = 'all' | 'books' | 'people' | 'authors' | 'lists';

// Everything `query` finds, of the `kind` looked for: the reader's own books
// (searched right here), every book in the catalogue, other readers, writers,
// and lists (useListsFound). Starting with @, only readers are looked for. Each
// part asks only when it's wanted, and only once there's enough typed to look
// for (`asked`: two letters, or one after @). `pending`: what's typed hasn't
// been looked for yet (it's still being typed), so every part counts as
// loading, the last found kept showing meanwhile.
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
  const lists = useListsFound(query, pending, wants('lists'));

  // The reader's own copy of a book the catalogue found, by its work
  const owned = useMemo(() => booksByWork(shelf.all), [shelf.all]);

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
    lists,
    owned,
    loading,
    // Anything still on its way
    looking: Object.values(loading).some(Boolean) || lists.looking,
  };
}

export type Found = ReturnType<typeof useSearch>;
