import { HttpError } from '../lib/errors.js';
import { cachedStale, warm } from './cache.js';
import { fromOpenLibrary } from './openLibrary.js';
import { LIST_PATH, seedsKept } from './readersLists.js';

// A book's lists on Open Library, which it takes its time over (see
// workLists): kept for days, given at once even once they're older, and
// asked for behind the scenes as the book is added
const DAYS = 3;
const keyOf = (workKey: string) => `lists5:${workKey}`;

type ListsAnswer = {
  entries?: { url?: string; name?: string; seed_count?: number }[];
};

// Open Library takes its time over a book's lists (12 to 20 seconds, as
// often as not), so they're waited for longer than anything else
const LISTS_WAIT_MS = 30_000;
// How many are shown: the most popular whose books can be shown here, of
// the first few looked into
const SHOWN = 4;
const CHECKED = 6;

// Lists readers have made on Open Library that hold the book: the biggest
// few whose books can be shown here (readersLists.ts), each opening as a
// list of ours. Lists of the same name ("to read", say, which many readers
// keep) are looked at once: the biggest of them.
async function workLists(workKey: string) {
  const { entries = [] } = await fromOpenLibrary<ListsAnswer>(
    `/works/${workKey}/lists.json?limit=50`,
    LISTS_WAIT_MS,
  );
  const seen = new Set<string>();
  const candidates = entries
    .filter((list) => list.url && list.name?.trim())
    .sort((a, b) => (b.seed_count ?? 0) - (a.seed_count ?? 0))
    .filter((list) => {
      const name = list
        .name!.trim()
        .toLowerCase()
        .replace(/[^\p{L}\p{N}]+/gu, ' ');
      if (seen.has(name)) return false;
      seen.add(name);
      return true;
    })
    .flatMap((list) => {
      const [, owner, id] = LIST_PATH.exec(list.url!) ?? [];
      return owner && id ? [{ owner, id, name: list.name!.trim() }] : [];
    })
    .slice(0, CHECKED);
  const lists = [];
  // One after another, as Open Library likes to be asked
  for (const list of candidates) {
    if (lists.length >= SHOWN) break;
    const seeds = await seedsKept(list.owner, list.id).catch(() => null);
    if (seeds?.length) lists.push({ ...list, books: seeds.length });
  }
  return { lists };
}

// A work the catalogue doesn't know has no lists
const lookUp = (workKey: string) =>
  workLists(workKey).catch((err: unknown) => {
    if (err instanceof HttpError && err.status === 404) return { lists: [] };
    throw err;
  });

export const listsOfWork = (workKey: string) =>
  cachedStale(keyOf(workKey), DAYS, () => lookUp(workKey));

export const warmListsOfWork = (workKey: string) =>
  warm(keyOf(workKey), DAYS, () => lookUp(workKey));
