import { z } from 'zod';
import { maybe, optionalText } from '../lib/validation.js';
import {
  cleanIsbn,
  EDITION_KEY,
  looksLikeIsbn,
  WORK_KEY,
} from '../lookup/openLibrary.js';
import { webLink } from './links.js';
import { placeRefSchema } from '../places/schemas.js';

// A list that may be missing or null, without its blank entries
const list = <T extends z.ZodType>(item: T, max: number, tooMany: string) =>
  z.preprocess(
    (value) =>
      Array.isArray(value)
        ? value.filter(
            (entry) =>
              entry != null && (typeof entry !== 'string' || entry.trim()),
          )
        : (value ?? []),
    z.array(item).max(max, tooMany),
  );

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

const day = maybe(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Check the date.'));

export const copySchema = z
  .object({
    place: maybe(placeRefSchema),
    location: optionalText(120),
    status: maybe(z.enum(['shelf', 'lent', 'borrowed'])).transform(
      (status) => status ?? 'shelf',
    ),
    reading: maybe(z.enum(['read', 'reading', 'unread'])),
    person: optionalText(120),
    since: day,
    due: day,
    condition: maybe(z.enum(['new', 'good', 'worn', 'battered'])),
    review: optionalText(20000),
    // A single note, as they once were, becomes the first of a list
    notes: z.preprocess(
      (value) => (typeof value === 'string' ? [value] : value),
      list(
        z.string().trim().max(5000, 'Keep a note under 5000 characters.'),
        100,
        'That’s a lot of notes. Keep it to 100.',
      ),
    ),
    quotes: list(
      z.string().trim().max(3000, 'Keep a quote under 3000 characters.'),
      100,
      'That’s a lot of quotes. Keep it to 100.',
    ),
    links: list(webLink, 20, 'Keep it to 20 links.'),
  })
  // Loan details mean nothing for a book that's at home
  .transform(({ person, since, due, ...copy }) =>
    copy.status === 'shelf' ? copy : { ...copy, person, since, due },
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
  publishedYear: maybe(
    z
      .number({ error: 'Check the year.' })
      .int('Check the year.')
      .min(1, 'Check the year.')
      .max(thisYear + 2, 'Check the year.'),
  ),
  pages: maybe(
    z
      .number({ error: 'Check the page count.' })
      .int('Check the page count.')
      .min(1, 'Check the page count.')
      .max(20000, 'Check the page count.'),
  ),
  language: optionalText(10),
  genres: list(
    z.string().trim().max(40, 'Keep a genre under 40 characters.'),
    10,
    'Keep it to 10 genres.',
  ),
  cover: maybe(
    z.object({
      url: z.url().refine(coverHost, 'That cover can’t be used.'),
      source: z.enum(['openlibrary', 'upload']),
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
