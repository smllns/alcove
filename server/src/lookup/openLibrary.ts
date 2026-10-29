import { HttpError } from '../lib/errors.js';
import { contact, HEADERS } from './agent.js';
import { throttle } from './throttle.js';

// Open Library (openlibrary.org): an open catalogue of books from the
// Internet Archive. No key needed. They ask for a User-Agent naming the app
// and a contact, and give requests that carry one 3 a second instead of 1.
const BASE = 'https://openlibrary.org';
const nextTurn = throttle(contact ? 3 : 1);

// A book in general, across all its editions
export type WorkResult = {
  workKey: string;
  title: string;
  subtitle?: string;
  authors: string[];
  firstPublishYear?: number;
  coverUrl?: string;
  editionCount: number;
};

export const coverUrl = (id: number | undefined) =>
  id && id > 0 ? `https://covers.openlibrary.org/b/id/${id}-L.jpg` : undefined;

const unavailable = () =>
  new HttpError(
    502,
    'lookup_unavailable',
    'The book catalogue isn’t answering. Try again in a moment.',
  );

// Answered with a failure on its side: something it can't give
export const REFUSED = 'lookup_refused';
const refused = () =>
  new HttpError(
    502,
    REFUSED,
    'The book catalogue couldn’t give that. Try again in a moment.',
  );

// Over their limit anyway, e.g. with several servers sharing it
const busy = () =>
  new HttpError(
    429,
    'catalogue_busy',
    'The book catalogue is busy. Give it a few seconds.',
  );

// `waitMs`: how long to wait for an answer before giving up on it
export async function fromOpenLibrary<T>(
  path: string,
  waitMs = 8000,
): Promise<T> {
  await nextTurn();
  const res = await fetch(`${BASE}${path}`, {
    headers: HEADERS,
    signal: AbortSignal.timeout(waitMs),
  }).catch(() => {
    throw unavailable();
  });
  if (res.status === 404)
    throw new HttpError(404, 'not_found', 'Nothing found.');
  if (res.status === 429) throw busy();
  // Answered, but with a failure of its own: it won't give that, as
  // against not answering at all
  if (res.status >= 500) throw refused();
  if (!res.ok) throw unavailable();
  return res.json() as Promise<T>;
}

// The year in a date as the catalogue writes one: "1891-01-07", "8 October
// 1920" or "c. 1564"
export const yearOf = (date: string | undefined) => {
  const match = date?.match(/\d{4}/);
  return match ? Number(match[0]) : undefined;
};

// Open Library's ids for a work and for one edition of it
export const WORK_KEY = /^OL\d+W$/;
export const EDITION_KEY = /^OL\d+M$/;

// Digits only, keeping a final X (ISBN-10 check digit)
export const cleanIsbn = (value: string) =>
  value.replace(/[^\dXx]/g, '').toUpperCase();
export const looksLikeIsbn = (value: string) =>
  /^(\d{9}[\dX]|\d{13})$/.test(cleanIsbn(value));

export type SearchDoc = {
  key: string;
  title: string;
  subtitle?: string | null;
  author_name?: string[];
  first_publish_year?: number | null;
  cover_i?: number;
  edition_count?: number;
};

export const SEARCH_FIELDS =
  'key,title,subtitle,author_name,first_publish_year,cover_i,edition_count';

export const toWork = (doc: SearchDoc): WorkResult => ({
  workKey: doc.key.replace('/works/', ''),
  title: doc.title,
  // Open Library sends explicit nulls for missing values
  subtitle: doc.subtitle ?? undefined,
  authors: doc.author_name ?? [],
  firstPublishYear: doc.first_publish_year ?? undefined,
  coverUrl: coverUrl(doc.cover_i),
  editionCount: doc.edition_count ?? 1,
});

// The catalogue's search, answering with its own records of the works
// found (`T`: those records with any more fields asked for)
export async function searchDocs<T extends SearchDoc = SearchDoc>(
  params: Record<string, string>,
) {
  const query = new URLSearchParams(params);
  return (await fromOpenLibrary<{ docs: T[] }>(`/search.json?${query}`)).docs;
}

const search = async (params: Record<string, string>) =>
  (await searchDocs({ fields: SEARCH_FIELDS, limit: '8', ...params })).map(
    toWork,
  );

// How much a list of results is read: a book with many editions is one
// people know
const popularity = (works: WorkResult[]) =>
  works.reduce((sum, work) => sum + work.editionCount, 0);

export async function searchWorks(query: string): Promise<WorkResult[]> {
  if (looksLikeIsbn(query)) return search({ isbn: cleanIsbn(query) });
  // The full-text search finds both titles and authors but takes seconds.
  // Searching titles and authors separately takes about one; whichever turns
  // up the better-known books is the one that was meant ("tartt" finds Donna
  // Tartt's novels, "sapiens" Harari's, not summaries by a press of that name).
  const [byTitle, byAuthor] = await Promise.all([
    search({ title: query }).catch(() => []),
    search({ author: query }).catch(() => []),
  ]);
  if (!byTitle.length && !byAuthor.length) return search({ q: query });
  return popularity(byAuthor) > popularity(byTitle) ? byAuthor : byTitle;
}
