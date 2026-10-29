import { HttpError } from '../lib/errors.js';
import { cached, peek } from './cache.js';
import {
  EDITION_KEY,
  fromOpenLibrary,
  REFUSED,
  WORK_KEY,
} from './openLibrary.js';
import { worksByKeys } from './worksByKeys.js';

// Lists readers have made on Open Library: found by name, and one opened,
// its books asked for a few dozen at a time, only as they're wanted. Each
// answer is kept for days, so a list opened again asks nothing.

const DAYS = 7;
// How many books of a list are asked for at once
const PAGE = 40;

// Where a reader's list lives on Open Library: /people/{owner}/lists/{id}
export const LIST_PATH = /^\/people\/([^/]+)\/lists\/(OL\d+L)$/;
export const OWNER = /^[\w.-]{1,100}$/;
export const LIST_ID = /^OL\d+L$/;

type ListsAnswer = {
  docs?: { url?: string; name?: string; seed_count?: number }[];
};

// How many of the lists a search finds are looked into, to keep only
// those whose books can be shown
const CHECKED = 8;

type SeedsAnswer = { entries?: { url?: string }[] };

// The books a list holds, in its order, as works (W) and editions (M)
async function seedsOf(owner: string, id: string) {
  const { entries = [] } = await fromOpenLibrary<SeedsAnswer>(
    `/people/${owner}/lists/${id}/seeds.json`,
  );
  return entries.flatMap(({ url = '' }) => {
    const key = url.split('/')[2] ?? '';
    const known =
      (url.startsWith('/works/') && WORK_KEY.test(key)) ||
      (url.startsWith('/books/') && EDITION_KEY.test(key));
    return known ? [key] : [];
  });
}

// A list's books from Open Library's API, or null when it won't give
// them (it fails on most lists holding works, not editions), remembered
// either way; not answering at all is only tried again later
const seedsKey = (owner: string, id: string) => `olseeds2:${owner}/${id}`;
export const seedsKept = (owner: string, id: string) =>
  cached(seedsKey(owner, id), DAYS, () =>
    seedsOf(owner, id).catch((err: unknown) => {
      if (err instanceof HttpError && err.code === REFUSED) return null;
      throw err;
    }),
  );

// Lists with `query` in their names, with books in them: the first few,
// to be looked into
async function findLists(query: string) {
  const { docs = [] } = await fromOpenLibrary<ListsAnswer>(
    `/search/lists.json?${new URLSearchParams({ q: query, limit: '30' })}`,
  );
  return docs
    .flatMap((doc) => {
      const [, owner, id] = LIST_PATH.exec(doc.url ?? '') ?? [];
      const name = doc.name?.trim().replace(/\s+/g, ' ');
      if (!owner || !id || !name || !doc.seed_count) return [];
      return [{ owner, id, name, books: doc.seed_count }];
    })
    .slice(0, CHECKED);
}

// Lists with `query` in their names, at once: those already looked into
// told apart (`readable`), those whose books can't be shown left out, the
// rest still to be looked into, one by one (checkReadersList), so each
// shows as soon as it's known
export async function searchReadersLists(query: string) {
  const found = await cached(`ollists3:${query.toLowerCase()}`, DAYS, () =>
    findLists(query),
  );
  const known = await peek<string[] | null>(
    found.map((list) => seedsKey(list.owner, list.id)),
  );
  return found.flatMap((list) => {
    const seeds = known.get(seedsKey(list.owner, list.id));
    if (seeds === undefined) return [list];
    return seeds?.length
      ? [{ ...list, books: seeds.length, readable: true }]
      : [];
  });
}

// Whether a list's books can be shown, and how many it holds
export async function checkReadersList(owner: string, id: string) {
  const seeds = await seedsKept(owner, id);
  return { books: seeds?.length ?? 0 };
}

// A page of a list's books (from 0), how many it holds, and whether
// there are more
export async function readersList(owner: string, id: string, page: number) {
  const seeds = await seedsKept(owner, id);
  if (!seeds)
    throw new HttpError(404, 'list_unreadable', 'That list can’t be opened.');
  const keys = seeds.slice(page * PAGE, (page + 1) * PAGE);
  const works = keys.length
    ? await cached(`ollist1:${owner}/${id}:${page}`, DAYS, () =>
        worksByKeys(keys),
      )
    : [];
  return { books: seeds.length, works, more: (page + 1) * PAGE < seeds.length };
}
