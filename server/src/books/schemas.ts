import { z } from 'zod';
import { bookFormats, coverSources } from '../db.js';
import { list, maybe, optionalText } from '../lib/validation.js';
import {
  cleanIsbn,
  EDITION_KEY,
  looksLikeIsbn,
  WORK_KEY,
} from '../lookup/openLibrary.js';
import { copySchema } from './copy.js';

// Covers may only come from the catalogue or our own upload storage
const coverHost = (url: string) => {
  const { protocol, hostname } = new URL(url);
  return (
    protocol === 'https:' &&
    (hostname === 'covers.openlibrary.org' ||
      hostname.endsWith('.public.blob.vercel-storage.com'))
  );
};

const thisYear = new Date().getFullYear();
// A year in print, from the earliest books to one announced for next year
const year = maybe(
  z
    .number({ error: 'Check the year.' })
    .int('Check the year.')
    .min(1, 'Check the year.')
    .max(thisYear + 2, 'Check the year.'),
);

export const bookInputSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Every book needs a title.')
    .max(300, 'That title is very long.'),
  subtitle: optionalText(300),
  authors: list(
    z.string().trim().max(120, 'That name is very long.'),
    20,
    'That’s a lot of authors. Keep it to 20.',
  ).refine((authors) => authors.length > 0, 'Who wrote it?'),
  isbn: maybe(
    z
      .string()
      .transform(cleanIsbn)
      .refine(looksLikeIsbn, 'An ISBN has 10 or 13 digits.'),
  ),
  publisher: optionalText(200),
  firstPublishedYear: year,
  publishedYear: year,
  pages: maybe(
    z
      .number({ error: 'Check the page count.' })
      .int('Check the page count.')
      .min(1, 'Check the page count.')
      .max(20000, 'Check the page count.'),
  ),
  // Language codes as Open Library writes them: eng, rus, fre…
  language: optionalText(10),
  originalLanguage: optionalText(10),
  // For a translation: what it was called, and who translated it
  originalTitle: optionalText(300),
  translators: list(
    z.string().trim().max(120, 'That name is very long.'),
    10,
    'That’s a lot of translators. Keep it to 10.',
  ),
  // Which series it belongs to, and where in it
  series: maybe(
    z.object({
      name: z
        .string()
        .trim()
        .min(1, 'Name the series.')
        .max(200, 'That name is very long.'),
      number: maybe(
        z
          .number({ error: 'Check the number.' })
          .positive('Check the number.')
          .max(10000, 'Check the number.'),
      ),
    }),
  ),
  format: maybe(z.enum(bookFormats)),
  genres: list(
    z.string().trim().max(40, 'Keep a genre under 40 characters.'),
    10,
    'Keep it to 10 genres.',
  ),
  cover: maybe(
    z.object({
      url: z.url().refine(coverHost, 'That cover can’t be used.'),
      source: z.enum(coverSources),
    }),
  ),
  openLibrary: maybe(
    z.object({
      work: maybe(z.string().regex(WORK_KEY)),
      edition: maybe(z.string().regex(EDITION_KEY)),
    }),
  ),
  copy: maybe(copySchema),
});

export type BookInput = z.infer<typeof bookInputSchema>;

// Adding asks first when the book is already on the shelves; `anotherCopy`
// is the reader saying yes, they have two
export const addBookSchema = bookInputSchema.extend({
  anotherCopy: z.boolean().default(false),
});
