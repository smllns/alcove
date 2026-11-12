import { useQuery } from '@tanstack/react-query';
import { readStoredJson, store } from '@/shared/lib/storage';
import { fetchSameWriters } from './authorApi';
import { knowSameWriters } from './writers';

// Which of the writers on the reader's shelves go by other names too (as
// the server knows: lookup/writerNames.ts), for them to be told as one
// everywhere (knowSameWriters). Kept in this browser, so they're one from
// the first look, and asked afresh behind it, and again whenever more of a
// writer's names are known (authorQuery).

const KEY = 'alcove.same-writers';
export const sameWritersKey = ['same-writers'] as const;

const stored = readStoredJson<string[][]>(KEY, []);
knowSameWriters(stored);
let known = JSON.stringify(stored);

// Asked for, and told to all only when it's changed
async function fetchSame() {
  const groups = await fetchSameWriters();
  const fresh = JSON.stringify(groups);
  if (fresh !== known) {
    known = fresh;
    knowSameWriters(groups);
    store(KEY, fresh);
  }
  return groups;
}

// The writers on the reader's shelves known as one, kept an hour
export const useSameWriters = () =>
  useQuery({
    queryKey: sameWritersKey,
    queryFn: fetchSame,
    staleTime: 60 * 60 * 1000,
  });
