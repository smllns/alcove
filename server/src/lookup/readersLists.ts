import { HttpError } from '../lib/errors.js';
import { tidyName } from '../lib/text.js';
import { cached, peek } from './cache.js';
import { cleanDescription, type OpenLibraryText } from './description.js';
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

// How many lists a search asks for, and how many of them, the biggest,
// are looked into, to keep only those whose books can be shown
const FOUND = 50;
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

// What's asked for, or `fallback` when Open Library answers with one of
// the failures given (`codes`): an answer to keep like any other
const orWhen = <T>(codes: string[], asked: Promise<T>, fallback: T) =>
  asked.catch((err: unknown) => {
    if (err instanceof HttpError && codes.includes(err.code)) return fallback;
    throw err;
  });

// A list's books from Open Library's API, or null when it won't give
// them (it fails on most lists holding works, not editions), remembered
// either way; not answering at all is only tried again later
const seedsKey = (owner: string, id: string) => `olseeds2:${owner}/${id}`;
export const seedsKept = (owner: string, id: string) =>
  cached(seedsKey(owner, id), DAYS, () =>
    orWhen([REFUSED], seedsOf(owner, id), null),
  );

type ListAnswer = { name?: string; description?: OpenLibraryText };

// What a list's called and what its maker says of it, if anything, kept
// for days; nothing at all when Open Library won't tell or hasn't it
const aboutKept = (owner: string, id: string) =>
  cached(`olabout1:${owner}/${id}`, DAYS, async () => {
    const { name, description } = await orWhen<ListAnswer>(
      [REFUSED, 'not_found'],
      fromOpenLibrary(`/people/${owner}/lists/${id}.json`),
      {},
    );
    return {
      name: name && (tidyName(name) || undefined),
      description: cleanDescription(description),
    };
  });

// Lists with `query` in their names, with books in them: the biggest few,
// to be looked into (Open Library gives them in no order of size, the
// biggest often far down; nor says when each was last changed, its search
// telling only when it last took them in)
async function findLists(query: string) {
  const { docs = [] } = await fromOpenLibrary<ListsAnswer>(
    `/search/lists.json?${new URLSearchParams({ q: query, limit: String(FOUND) })}`,
  );
  return docs
    .flatMap((doc) => {
      const [, owner, id] = LIST_PATH.exec(doc.url ?? '') ?? [];
      const name = doc.name && tidyName(doc.name);
      if (!owner || !id || !name || !doc.seed_count) return [];
      return [{ owner, id, name, books: doc.seed_count }];
    })
    .sort((a, b) => b.books - a.books)
    .slice(0, CHECKED);
}

// Lists with `query` in their names, at once: those already looked into
// told apart (`readable`), those whose books can't be shown left out, the
// rest still to be looked into, one by one (checkReadersList), so each
// shows as soon as it's known
export async function searchReadersLists(query: string) {
  const found = await cached(`ollists9:${query.toLowerCase()}`, DAYS, () =>
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
// there are more; the first, with what it's called and said to be, when
// Open Library tells (the list's shown all the same when it doesn't)
export async function readersList(owner: string, id: string, page: number) {
  const seeds = await seedsKept(owner, id);
  if (!seeds)
    throw new HttpError(404, 'list_unreadable', 'That list can’t be opened.');
  const keys = seeds.slice(page * PAGE, (page + 1) * PAGE);
  const [works, about] = await Promise.all([
    keys.length
      ? cached(`ollist6:${owner}/${id}:${page}`, DAYS, () => worksByKeys(keys))
      : [],
    page === 0 ? aboutKept(owner, id).catch(() => undefined) : undefined,
  ]);
  return {
    ...about,
    books: seeds.length,
    works,
    more: (page + 1) * PAGE < seeds.length,
  };
}
