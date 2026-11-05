import { z } from 'zod';
import { bookFormats, coverSources } from '../db.js';
import { list, maybe, OBJECT_ID, optionalText } from '../lib/validation.js';
import {
  cleanIsbn,
  EDITION_KEY,
  looksLikeIsbn,
  WORK_KEY,
} from '../lookup/openLibrary.js';
import { DESCRIPTION_MAX } from '../lookup/description.js';
import { copySchema } from './copy.js';
import { ISBNS_AT_ONCE } from '../lookup/byIsbn.js';

// Covers may only come from the catalogue or our own upload storage
export const coverHost = (url: string) => {
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

const bookFields = z.object({
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
  // The ids of the reader's lists it's in
  lists: list(z.string().max(40), 200, 'That’s a lot of lists.'),
  description: optionalText(DESCRIPTION_MAX),
  // Out of five, to one decimal place: 4.2
  averageRating: maybe(
    z
      .number({ error: 'Out of 5, like 4.2.' })
      .min(1, 'Out of 5, like 4.2.')
      .max(5, 'Out of 5, like 4.2.'),
  ).transform((value) =>
    value === undefined ? undefined : Math.round(value * 10) / 10,
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

// A book read without having it isn't bound in anything (its copy loses
// its place, loan and condition the same way, copySchema)
const unbound = <
  T extends { format?: unknown; copy?: { nonPhysical?: unknown } },
>(
  book: T,
) => (book.copy?.nonPhysical ? { ...book, format: undefined } : book);

export const bookInputSchema = bookFields.transform(unbound);

export type BookInput = z.infer<typeof bookInputSchema>;

// Adding asks first when the book is already on the shelves; `anotherCopy`
// is the reader saying yes, they have two
export const addBookSchema = bookFields
  .extend({ anotherCopy: z.boolean().default(false) })
  .transform(unbound);

// A batch of things brought over from another site (books, books wanted):
// which import it's part of, the same for each batch of it, to undo it
// by; and as many as the catalogue's asked about at once
export const importBatch = <T extends z.ZodType>(item: T) =>
  z.object({
    importId: z.string().regex(OBJECT_ID),
    books: z
      .array(item)
      .min(1, 'Nothing to bring over.')
      .max(ISBNS_AT_ONCE, `Send at most ${ISBNS_AT_ONCE} books at a time.`),
  });

// Books brought over, each to be checked on its own (one that isn't a
// book we can take doesn't stop the rest)
export const importSchema = importBatch(z.unknown());
