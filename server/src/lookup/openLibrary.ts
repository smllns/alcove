import type { BookFormat } from '../db.js';
import { HttpError } from '../lib/errors.js';
import { cleanDescription } from './description.js';
import { genresOf } from './genres.js';
import { bookFormat, isDigital } from './format.js';
import { cached } from './cache.js';
import { contact, HEADERS } from './agent.js';
import { throttle } from './throttle.js';

// Open Library (openlibrary.org): an open catalogue of books from the
// Internet Archive. No key needed. They ask for a User-Agent naming the app
// and a contact, and give requests that carry one 3 a second instead of 1.
export const BASE = 'https://openlibrary.org';
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

// One specific printing
export type EditionResult = {
  editionKey: string;
  title: string;
  subtitle?: string;
  isbn?: string;
  publisher?: string;
  publishedYear?: number;
  pages?: number;
  language?: string;
  format?: BookFormat;
  coverUrl?: string;
};

const coverUrl = (id: number | undefined) =>
  id && id > 0 ? `https://covers.openlibrary.org/b/id/${id}-L.jpg` : undefined;

const unavailable = () =>
  new HttpError(
    502,
    'lookup_unavailable',
    'The book catalogue isn’t answering. Try again in a moment.',
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

type EditionDoc = {
  key: string;
  title: string;
  subtitle?: string;
  isbn_13?: string[];
  isbn_10?: string[];
  publishers?: string[];
  publish_date?: string;
  number_of_pages?: number;
  covers?: number[];
  languages?: { key: string }[];
  physical_format?: string;
};

const toEdition = (doc: EditionDoc): EditionResult => ({
  editionKey: doc.key.replace('/books/', ''),
  title: doc.title,
  subtitle: doc.subtitle ?? undefined,
  isbn: doc.isbn_13?.[0] ?? doc.isbn_10?.[0],
  publisher: doc.publishers?.[0],
  publishedYear: yearOf(doc.publish_date),
  pages: doc.number_of_pages,
  language: doc.languages?.[0]?.key.replace('/languages/', ''),
  format: bookFormat(doc.physical_format),
  coverUrl: coverUrl(doc.covers?.[0]),
});

// Most useful first: English, with a cover, with an ISBN, then newest
const usefulness = (e: EditionResult) =>
  (e.language === 'eng' ? 8 : 0) +
  (e.coverUrl ? 4 : 0) +
  (e.isbn ? 2 : 0) +
  (e.pages ? 1 : 0);

export async function workEditions(workKey: string): Promise<EditionResult[]> {
  const data = await fromOpenLibrary<{ entries: EditionDoc[] }>(
    `/works/${workKey}/editions.json?limit=60`,
  );
  // Ours is a library of physical books, so e-books and audiobooks go
  return data.entries
    .filter((doc) => !isDigital(doc.physical_format))
    .map(toEdition)
    .sort(
      (a, b) =>
        usefulness(b) - usefulness(a) ||
        (b.publishedYear ?? 0) - (a.publishedYear ?? 0),
    );
}

export async function editionByIsbn(isbn: string): Promise<EditionResult> {
  return toEdition(
    await fromOpenLibrary<EditionDoc>(`/isbn/${cleanIsbn(isbn)}.json`),
  );
}

// A work as the catalogue keeps it: what several lookups about one book
// (what it's about, who wrote it, books like it) all start from
type WorkDoc = {
  title?: string;
  description?: string | { value?: string };
  subjects?: string[];
  authors?: { author?: { key?: string } }[];
};

// Asked of the catalogue once, then kept for all of them
export const workDoc = (workKey: string) =>
  cached(`work1:${workKey}`, 30, () =>
    fromOpenLibrary<WorkDoc>(`/works/${workKey}.json`),
  );

// The key of a work's first author, if it names one
export const firstAuthor = (work: WorkDoc) =>
  work.authors?.[0]?.author?.key?.replace('/authors/', '');

// What the book is about, if the catalogue says, and the genres its
// subjects point to
export async function workDetails(workKey: string) {
  const { description, subjects } = await workDoc(workKey);
  return {
    description:
      cleanDescription(
        typeof description === 'string' ? description : description?.value,
      ) ?? null,
    genres: genresOf(subjects),
  };
}

type RatingsDoc = { summary?: { average?: number | null; count?: number } };

// How the catalogue's readers rate the book: the average out of five and
// how many rated it; none when nobody has
export async function workRatings(workKey: string) {
  const { summary } = await fromOpenLibrary<RatingsDoc>(
    `/works/${workKey}/ratings.json`,
  );
  return summary?.average && summary.count
    ? { average: Math.round(summary.average * 10) / 10, count: summary.count }
    : null;
}
