import { z } from 'zod';
import { copyConditions, copyStatuses, readingStates } from '../db.js';
import { day, list, maybe, optionalText } from '../lib/validation.js';
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
    date: day,
  }),
).transform((value) =>
  value && (value.how || value.from || value.date) ? value : undefined,
);

// The reader's own copy
export const copySchema = z
  .object({
    place: maybe(placeRefSchema),
    location: optionalText(120),
    status: maybe(z.enum(copyStatuses)).transform(
      (status) => status ?? 'shelf',
    ),
    reading: maybe(z.enum(readingStates)),
    rating,
    acquired,
    person: optionalText(120),
    since: day,
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
  // Loan details mean nothing for a book that's at home
  .transform(({ person, since, due, ...copy }) =>
    copy.status === 'shelf' ? copy : { ...copy, person, since, due },
  );
