import { z } from 'zod';
import { coverHost } from '../books/schemas.js';
import { list, maybe, nameOf } from '../lib/validation.js';
import { WORK_KEY } from '../lookup/openLibrary.js';

// A new list: its name, and whether other readers may find it (they may,
// unless it's said otherwise)
export const newListSchema = z.object({
  name: nameOf('list'),
  public: z.boolean().default(true),
});

// A list changed: its name, whether other readers may find it, or both
export const listChangeSchema = z
  .object({ name: nameOf('list').optional(), public: z.boolean().optional() })
  .refine(
    (change) => change.name !== undefined || change.public !== undefined,
    'Nothing to change.',
  );

// Most books from the catalogue changed in a list at once
const MAX_CHANGED = 500;
const TOO_MANY = 'That’s a lot of books at once.';

// A book from the catalogue, as a search found it
const listedWorkSchema = z.object({
  workKey: z.string().regex(WORK_KEY),
  title: z.string().trim().min(1).max(500),
  authors: list(z.string().trim().max(200), 20, 'That’s a lot of authors.'),
  coverUrl: maybe(z.url().refine(coverHost, 'That cover can’t be used.')),
  firstPublishYear: maybe(z.number().int().min(-5000).max(3000)),
  editionCount: maybe(z.number().int().min(0)),
});

// Books from the catalogue put in a list, and taken out of it (by work)
export const listWorksSchema = z.object({
  add: list(listedWorkSchema, MAX_CHANGED, TOO_MANY),
  remove: list(z.string().regex(WORK_KEY), MAX_CHANGED, TOO_MANY),
});

// A book in the pile of a list kept from another reader: one of the
// catalogue's, or one of that reader's own (book-…)
const pileWorkSchema = listedWorkSchema.extend({
  workKey: z.string().regex(/^(OL\d+W|book-[0-9a-f]{24})$/),
});

// Another reader's list kept: theirs here (by its id) or one made on Open
// Library (owner/id), as it is now, with the first of its books
const savedBase = {
  name: z.string().trim().min(1).max(200),
  books: z.number().int().min(0).max(100_000),
  works: list(pileWorkSchema, 16, 'That’s a lot of books for a pile.'),
};
export const savedListSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('shared'),
    ref: z.string().regex(/^[0-9a-f]{24}$/),
    ...savedBase,
  }),
  z.object({
    kind: z.literal('readers'),
    ref: z.string().regex(/^[\w.-]{1,100}\/OL\d+L$/),
    ...savedBase,
  }),
]);
