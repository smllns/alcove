import {
  type InfiniteData,
  type QueryClient,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  addBook,
  deleteBook,
  fetchBook,
  fetchBooks,
  fetchUploadsEnabled,
  updateBook,
  type BooksPage,
} from './api';
import type { Book, BookInput, CopyDetails } from './types';

const bookKeys = {
  all: ['books'] as const,
  shelf: ['books', 'shelf'] as const,
  book: (id: string) => ['books', 'one', id] as const,
};

// Changes the books already loaded onto the shelf, before the refetch
// comes back with the same
const onShelf = (client: QueryClient, change: (page: BooksPage) => BooksPage) =>
  client.setQueryData<InfiniteData<BooksPage>>(
    bookKeys.shelf,
    (data) => data && { ...data, pages: data.pages.map(change) },
  );

// The reader's books, newest first, a page at a time
export const useBooks = () =>
  useInfiniteQuery({
    queryKey: bookKeys.shelf,
    queryFn: ({ pageParam }) => fetchBooks(pageParam),
    initialPageParam: null as string | null,
    getNextPageParam: (last) => last.nextCursor,
  });

// One book. Opened from the shelf, it's there at once, as the shelf had it.
export function useBook(id: string) {
  const client = useQueryClient();
  return useQuery({
    queryKey: bookKeys.book(id),
    queryFn: () => fetchBook(id),
    initialData: () =>
      client
        .getQueryData<InfiniteData<BooksPage>>(bookKeys.shelf)
        ?.pages.flatMap((page) => page.books)
        .find((book) => book.id === id),
    initialDataUpdatedAt: () =>
      client.getQueryState(bookKeys.shelf)?.dataUpdatedAt,
  });
}

export function useAddBook() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: addBook,
    onSuccess: () => client.invalidateQueries({ queryKey: bookKeys.all }),
  });
}

export function useUpdateBook() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: BookInput }) =>
      updateBook(id, input),
    onSuccess: (book: Book) => {
      client.setQueryData(bookKeys.book(book.id), book);
      onShelf(client, (page) => ({
        ...page,
        books: page.books.map((b) => (b.id === book.id ? book : b)),
      }));
      void client.invalidateQueries({ queryKey: bookKeys.all });
      // It may have moved to another place
      void client.invalidateQueries({ queryKey: ['places'] });
    },
  });
}

export function useDeleteBook() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: deleteBook,
    onSuccess: (_, id) => {
      // Off the shelf straight away, before the refetch comes back
      onShelf(client, (page) => ({
        ...page,
        books: page.books.filter((book) => book.id !== id),
        total: Math.max(page.total - 1, 0),
      }));
      void client.invalidateQueries({ queryKey: bookKeys.all });
      // Its place now holds one book fewer
      void client.invalidateQueries({ queryKey: ['places'] });
    },
  });
}

// Something about the book changed right on its page (what it's about),
// nothing else
export function useEditBook(book: Book) {
  const update = useUpdateBook();
  return {
    // The book as it is, with the change; the server takes only what's
    // part of a book, not its id or dates
    save: (change: Partial<BookInput>) =>
      update.mutate({ id: book.id, input: { ...book, ...change } }),
    // The book as it's being changed to, until it's saved
    pending: update.isPending ? update.variables.input : undefined,
    error: update.error?.message,
  };
}

// The same for the reader's copy (the rating, the notes, the quotes)
export function useEditCopy(book: Book) {
  const edit = useEditBook(book);
  return {
    save: (change: Partial<CopyDetails>) =>
      edit.save({ copy: { status: 'shelf', ...book.copy, ...change } }),
    pending: edit.pending?.copy,
    error: edit.error,
  };
}

export const useUploadsEnabled = () =>
  useQuery({
    queryKey: ['uploads', 'enabled'],
    queryFn: fetchUploadsEnabled,
    staleTime: Infinity,
  }).data ?? false;
