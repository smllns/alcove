import { z } from 'zod';
import {
  copyConditions,
  copyStatuses,
  readingStates,
  type ReadingState,
} from '../db.js';
import { day, list, maybe, optionalText, pastDay } from '../lib/validation.js';
import { placeRefSchema } from '../places/schemas.js';
import { webLink } from './links.js';

// Stars out of five, in halves, as on Letterboxd
const rating = maybe(
  z
    .number({ error: 'Rate it from half a star to five.' })
    .min(0.5, 'Rate it from half a star to five.')
    .max(5, 'Rate it from half a star to five.')
    .multipleOf(0.5, 'Rate it in half stars.'),
);

// How the book came to the reader: bought, a gift, … or in their own words.
// Dropped altogether when nothing in it is filled in.
const acquired = maybe(
  z.object({
    how: optionalText(60),
    from: optionalText(120),
    date: pastDay,
  }),
).transform((value) =>
  value && (value.how || value.from || value.date) ? value : undefined,
);

// When the reader read it. A book with a start but no finish is still
// being read, whatever it was marked as; one not read has no dates at all.
const readingDates = (
  reading: ReadingState | undefined,
  started: string | undefined,
  finished: string | undefined,
) => {
  if (reading === 'read' && started && !finished)
    return { reading: 'reading' as const, started };
  if (reading === 'read') return { reading, started, finished };
  if (reading === 'reading') return { reading, started };
  return { reading };
};

// The reader's own copy
export const copySchema = z
  .object({
    place: maybe(placeRefSchema),
    location: optionalText(120),
    status: maybe(z.enum(copyStatuses)).transform(
      (status) => status ?? 'shelf',
    ),
    reading: maybe(z.enum(readingStates)),
    started: pastDay,
    finished: pastDay,
    rating,
    acquired,
    person: optionalText(120),
    since: pastDay,
    due: day,
    condition: maybe(z.enum(copyConditions)),
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
  .refine(
    ({ reading, started, finished }) =>
      reading !== 'read' || !started || !finished || finished >= started,
    { path: ['finished'], message: 'It can’t end before it started.' },
  )
  .refine(
    ({ status, since, due }) =>
      status === 'shelf' || !since || !due || due >= since,
    { path: ['due'], message: 'Due back can’t come before the loan began.' },
  )
  // Loan details mean nothing for a book that's at home
  .transform(({ person, since, due, reading, started, finished, ...copy }) => ({
    ...copy,
    ...(copy.status !== 'shelf' && { person, since, due }),
    ...readingDates(reading, started, finished),
  }));
