import { HttpError } from '../lib/errors.js';
import { cachedStale, warm } from './cache.js';
import { BASE, fromOpenLibrary } from './openLibrary.js';

// A book's lists on Open Library, which it takes its time over (see
// workLists): kept for days, given at once even once they're older, and
// asked for behind the scenes as the book is added
const DAYS = 3;
const keyOf = (workKey: string) => `lists4:${workKey}`;

type ListsAnswer = {
  entries?: { url?: string; name?: string; seed_count?: number }[];
};

// Open Library takes its time over a book's lists (12 to 20 seconds, as
// often as not), so they're waited for longer than anything else
const LISTS_WAIT_MS = 30_000;
// How many are shown: the most popular
const SHOWN = 4;

// Lists readers have made on Open Library that hold the book: the biggest
// few. Lists of the same name ("to read", say, which many readers keep)
// are shown once: the biggest of them.
async function workLists(workKey: string) {
  const { entries = [] } = await fromOpenLibrary<ListsAnswer>(
    `/works/${workKey}/lists.json?limit=50`,
    LISTS_WAIT_MS,
  );
  const seen = new Set<string>();
  const lists = entries
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
    .slice(0, SHOWN)
    .map((list) => ({
      name: list.name!.trim(),
      url: `${BASE}${list.url}`,
      books: list.seed_count ?? 0,
    }));
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
