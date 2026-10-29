import type { BookFormat } from '../db.js';
import { bookFormat, isDigital } from './format.js';
import { cleanIsbn, coverUrl, fromOpenLibrary, yearOf } from './openLibrary.js';

// The editions of a book, from Open Library: each printing of it, to pick
// the reader's copy from

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
