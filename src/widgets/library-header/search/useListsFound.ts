import {
  useFeaturedLists,
  useReadableLists,
  useReadersLists,
} from '@/entities/book/catalogueListQueries';
import { searchable } from '@/entities/book/matches';
import {
  useLists,
  useSavedLists,
  useSharedLists,
} from '@/entities/list/queries';
import { isSaved } from '@/entities/list/opening';
import type { SavedList } from '@/entities/list/types';
import { useDebouncedValue } from '@/shared/lib/useDebouncedValue';

// How long what's typed has to stand before Open Library is asked, and
// how much of it there has to be: more than for the lists here, so it's
// asked as seldom as it can be
const SETTLED_MS = 500;
const LETTERS = 3;

// Lists `query` finds (when it's `wanted`): at once, the reader's own, those
// they've kept, and those every reader sees; then other readers' public ones
// (any kept left out, being there already); and those made on Open Library,
// once what's typed has settled, each as soon as it's known its books can be
// shown. `pending`: what's typed hasn't been looked for yet.
export function useListsFound(query: string, pending: boolean, wanted = true) {
  const lists = useLists();
  const kept = useSavedLists().data ?? [];
  const everyone = useFeaturedLists().data ?? [];
  const sought = wanted ? searchable(query) : '';
  const shared = useSharedLists(sought ? query : '');
  const settled = useDebouncedValue(query, SETTLED_MS);
  const further = sought && query.length >= LETTERS;
  const readers = useReadersLists(further && settled === query ? query : '');
  const readable = useReadableLists(further ? (readers.data ?? []) : []);

  const named = <T extends { name: string }>(all: T[]) =>
    sought ? all.filter((list) => searchable(list.name).includes(sought)) : [];
  const isKept = (kind: SavedList['kind'], ref: string) =>
    kept.some((list) => isSaved(list, kind, ref));
  const loading = {
    // Looking as soon as anything's typed, before it's settled enough to
    // be looked for
    shared: wanted && (pending || (Boolean(sought) && shared.isFetching)),
    readers:
      Boolean(further) &&
      (pending || settled !== query || readers.isFetching || readable.checking),
  };
  const found = {
    mine: named(lists.data?.lists ?? []),
    saved: named(kept),
    featured: named(everyone),
    shared: (sought ? (shared.data ?? []) : []).filter(
      (list) => !isKept('shared', list.id),
    ),
    readers: readable.lists.filter(
      (list) => !isKept('readers', `${list.owner}/${list.id}`),
    ),
  };
  return {
    query: sought ? query : '',
    ...found,
    counts: lists.data?.counts ?? {},
    readersFailed: Boolean(further) && readers.isError,
    loading,
    looking: loading.shared || loading.readers,
    some: Object.values(found).some((each) => each.length > 0),
  };
}

export type ListsFoundResult = ReturnType<typeof useListsFound>;
