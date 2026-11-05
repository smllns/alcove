import {
  type InfiniteData,
  type QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { inBatches } from '@/shared/lib/inBatches';
import { fetchBooks, type BooksPage } from './api';
import {
  deleteAllBooks,
  fetchLastImport,
  IMPORT_BATCH,
  importBooks,
  undoImport,
} from './importApi';
import { bookKeys, recount } from './queries';
import type { BookInput } from './types';

// Books brought over from another site, batch after batch, how far it's
// got told as it goes (`onBatch`); the shelf asked afresh once they're in
export function useImportBooks() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({
      books,
      importId,
      onBatch,
    }: {
      books: BookInput[];
      importId: string;
      onBatch: (done: number) => void;
    }) =>
      inBatches(
        books,
        IMPORT_BATCH,
        (batch) => importBooks(batch, importId),
        onBatch,
      ),
    onSettled: async () => {
      recount(client);
      await client.invalidateQueries({ queryKey: bookKeys.all });
      // The shelf loaded whole behind the rest of the import, so the books
      // (and the sky, which needs every one) open at once, not page by page
      void loadWholeShelf(client).catch(() => {});
    },
  });
}

// Every page of the shelf asked for now, one after another, and put in
// place together, as if each had been loaded in turn
async function loadWholeShelf(client: QueryClient) {
  const pages: BooksPage[] = [];
  const pageParams: (string | null)[] = [];
  let after: string | null = null;
  do {
    pageParams.push(after);
    const page: BooksPage = await fetchBooks(after);
    pages.push(page);
    after = page.nextCursor;
  } while (after);
  client.setQueryData<InfiniteData<BooksPage>>(bookKeys.shelf, {
    pages,
    pageParams,
  });
}

const lastImportKey = ['books', 'last-import'] as const;

// The latest import, if any, to undo (in Settings)
export const useLastImport = () =>
  useQuery({ queryKey: lastImportKey, queryFn: fetchLastImport });

// Books taken off together: an import undone, or every one. Everything
// that shows books and lists asked afresh.
function useTakeOff<T>(take: (arg: T) => Promise<unknown>) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: take,
    onSettled: () => {
      recount(client);
      return client.invalidateQueries({ queryKey: bookKeys.all });
    },
  });
}
export const useUndoImport = () => useTakeOff(undoImport);
export const useDeleteAllBooks = () => useTakeOff(deleteAllBooks);
