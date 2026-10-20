import {
  type InfiniteData,
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  addBook,
  deleteBook,
  fetchBooks,
  fetchEditions,
  fetchUploadsEnabled,
  searchCatalogue,
  type BooksPage,
} from './api';

export const bookKeys = {
  all: ['books'] as const,
  // Every list of the reader's books: all of them, or a search's results
  shelves: ['books', 'shelf'] as const,
  shelf: (search: string) => ['books', 'shelf', search] as const,
  search: (query: string) => ['catalogue', 'search', query] as const,
  editions: (workKey: string) => ['catalogue', 'editions', workKey] as const,
};

// The reader's books (or those matching `search`), newest first, a page at
// a time. A new search keeps the last results up until its own arrive.
export const useBooks = (search = '') =>
  useInfiniteQuery({
    queryKey: bookKeys.shelf(search),
    queryFn: ({ pageParam }) => fetchBooks(pageParam, search),
    placeholderData: search ? keepPreviousData : undefined,
    initialPageParam: null as string | null,
    getNextPageParam: (last) => last.nextCursor,
  });

export function useAddBook() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: addBook,
    onSuccess: () => client.invalidateQueries({ queryKey: bookKeys.all }),
  });
}

export function useDeleteBook() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: deleteBook,
    onSuccess: (_, id) => {
      // Off the shelf (and out of any search) straight away, before the
      // refetch comes back
      client.setQueriesData<InfiniteData<BooksPage>>(
        { queryKey: bookKeys.shelves },
        (data) =>
          data && {
            ...data,
            pages: data.pages.map((page) => ({
              ...page,
              books: page.books.filter((book) => book.id !== id),
              total: Math.max(page.total - 1, 0),
            })),
          },
      );
      void client.invalidateQueries({ queryKey: bookKeys.all });
      // Its place now holds one book fewer
      void client.invalidateQueries({ queryKey: ['places'] });
    },
  });
}

// Keeps showing the last results while the next query loads, so the list
// doesn't flash empty between keystrokes
export const useCatalogueSearch = (query: string) =>
  useQuery({
    queryKey: bookKeys.search(query),
    queryFn: () => searchCatalogue(query),
    enabled: query.length >= 2,
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
  });

export const useEditions = (workKey: string | undefined) =>
  useQuery({
    queryKey: bookKeys.editions(workKey ?? ''),
    queryFn: () => fetchEditions(workKey!),
    enabled: Boolean(workKey),
    staleTime: 30 * 60 * 1000,
  });

export const useUploadsEnabled = () =>
  useQuery({
    queryKey: ['uploads', 'enabled'],
    queryFn: fetchUploadsEnabled,
    staleTime: Infinity,
  }).data ?? false;
