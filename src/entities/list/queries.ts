import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from '@tanstack/react-query';
import {
  changeListWorks,
  createList,
  deleteList,
  fetchLists,
  fetchSaved,
  fetchSharedList,
  saveList,
  unsaveList,
  changeList,
  searchSharedLists,
  type ListChange,
  type WorksChange,
} from './api';
import { isSaved } from './opening';
import type { BookList, Lists, SavedList } from './types';

const listKeys = { all: ['lists'] as const };

// Asked afresh when a list is made, and when a book changes
// (entities/book/queries), which is when how many each holds can change
export const useLists = () =>
  useQuery({
    queryKey: listKeys.all,
    queryFn: fetchLists,
    staleTime: Infinity,
  });

export function useCreateList() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: createList,
    onSuccess: ({ lists, counts }) =>
      client.setQueryData<Lists>(listKeys.all, { lists, counts }),
  });
}

// One list changed in what's kept of them all, at once, before the server
// answers
function patchList(
  client: QueryClient,
  id: string,
  change: (list: BookList) => BookList,
) {
  void client.cancelQueries({ queryKey: listKeys.all });
  client.setQueryData<Lists>(
    listKeys.all,
    (data) =>
      data && {
        ...data,
        lists: data.lists.map((list) => (list.id === id ? change(list) : list)),
      },
  );
}

// Called by its new name, or made public or private, at once; as it was
// again if the server won't have it (another list's called that, say)
export function useChangeList() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: changeList,
    onMutate: ({ id, ...change }: ListChange) => {
      const was = client.getQueryData<Lists>(listKeys.all);
      patchList(client, id, (list) => ({ ...list, ...change }));
      return { was };
    },
    onError: (_, __, context) =>
      context?.was && client.setQueryData<Lists>(listKeys.all, context.was),
    onSuccess: (lists) => client.setQueryData<Lists>(listKeys.all, lists),
  });
}

// Gone, and out of every book it held: those asked afresh too
export function useDeleteList() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: deleteList,
    onSuccess: (lists) => {
      client.setQueryData<Lists>(listKeys.all, lists);
      void client.invalidateQueries({ queryKey: ['books'] });
    },
  });
}

// Books from the catalogue put in a list or taken out: changed in it at
// once, the server told after, and its answer taken once the last of a
// run of changes is done
export function useChangeListWorks() {
  const client = useQueryClient();
  const mutationKey = ['lists', 'works'];
  return useMutation({
    mutationKey,
    mutationFn: changeListWorks,
    onMutate: ({ id, add = [], remove = [] }: WorksChange) => {
      const out = new Set([...remove, ...add.map((work) => work.workKey)]);
      patchList(client, id, (list) => ({
        ...list,
        works: [
          ...(list.works ?? []).filter((work) => !out.has(work.workKey)),
          ...add,
        ],
      }));
    },
    onSettled: (lists) => {
      if (client.isMutating({ mutationKey }) > 1) return;
      if (lists) client.setQueryData<Lists>(listKeys.all, lists);
      else void client.invalidateQueries({ queryKey: listKeys.all });
    },
  });
}

// Other readers' public lists by name, once two letters are typed
export const useSharedLists = (query: string) =>
  useQuery({
    queryKey: [...listKeys.all, 'shared', 'search', query.toLowerCase()],
    queryFn: () => searchSharedLists(query),
    enabled: query.length >= 2,
    staleTime: 5 * 60 * 1000,
  });

// Another reader's public list, opened
export const useSharedList = (id: string) =>
  useQuery({
    queryKey: [...listKeys.all, 'shared', id],
    queryFn: () => fetchSharedList(id),
    staleTime: 5 * 60 * 1000,
  });

const savedKey = [...listKeys.all, 'saved'];

// Other readers' lists the reader's kept
export const useSavedLists = () =>
  useQuery({ queryKey: savedKey, queryFn: fetchSaved, staleTime: Infinity });

// One kept, or let go (`keep`): so at once, as it was again if the server
// won't have it
export function useKeepList() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ list, keep }: { list: SavedList; keep: boolean }) =>
      keep ? saveList(list) : unsaveList(list),
    onMutate: ({ list, keep }) => {
      void client.cancelQueries({ queryKey: savedKey });
      const was = client.getQueryData<SavedList[]>(savedKey);
      const others = (was ?? []).filter(
        (each) => !isSaved(each, list.kind, list.ref),
      );
      client.setQueryData(savedKey, keep ? [list, ...others] : others);
      return { was };
    },
    onError: (_, __, context) =>
      context?.was && client.setQueryData(savedKey, context.was),
    onSuccess: (saved) => client.setQueryData(savedKey, saved),
  });
}
