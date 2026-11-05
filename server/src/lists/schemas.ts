import { z } from 'zod';
import { coverHost, importBatch } from '../books/schemas.js';
import {
  boundedText,
  list,
  maybe,
  nameOf,
  optionalText,
  OBJECT_ID,
} from '../lib/validation.js';

// As long as what's said about a list may be
const ABOUT_MAX = 300;

// A new list: its name, whether other readers may find it (they may,
// unless it's said otherwise), and a line or two about it, if any
export const newListSchema = z.object({
  name: nameOf('list'),
  public: z.boolean().default(true),
  description: optionalText(ABOUT_MAX),
});

// A list changed: its name, whether other readers may find it, what's
// said about it (nothing, once it's emptied), or any of them
export const listChangeSchema = z
  .object({
    name: nameOf('list').optional(),
    public: z.boolean().optional(),
    description: boundedText(ABOUT_MAX).optional(),
  })
  .refine(
    (change) => Object.values(change).some((value) => value !== undefined),
    'Nothing to change.',
  );

// Most books from the catalogue changed in a list at once
const MAX_CHANGED = 500;
const TOO_MANY = 'That’s a lot of books at once.';

// A book from the catalogue's work, or one kept as it came from another
// site (typed-…)
// The start of the key of a book kept as it came from another site
export const TYPED = 'typed-';
const LISTED_KEY = /^(OL\d+W|typed-[0-9a-f]{24})$/;

// A book from the catalogue, as a search found it, or one kept as it came
// (put back after being taken out), with the ISBN it came with
export const listedWorkSchema = z.object({
  workKey: z.string().regex(LISTED_KEY),
  title: z.string().trim().min(1).max(500),
  authors: list(z.string().trim().max(200), 20, 'That’s a lot of authors.'),
  coverUrl: maybe(z.url().refine(coverHost, 'That cover can’t be used.')),
  firstPublishYear: maybe(z.number().int().min(-5000).max(3000)),
  editionCount: maybe(z.number().int().min(0)),
  isbn: optionalText(20),
});

// Books from the catalogue put in a list, and taken out of it (by work;
// one put in as it came from another site, by its own key, typed-…)
export const listWorksSchema = z.object({
  add: list(listedWorkSchema, MAX_CHANGED, TOO_MANY),
  remove: list(z.string().regex(LISTED_KEY), MAX_CHANGED, TOO_MANY),
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
    ref: z.string().regex(OBJECT_ID),
    ...savedBase,
  }),
  z.object({
    kind: z.literal('readers'),
    ref: z.string().regex(/^[\w.-]{1,100}\/OL\d+L$/),
    ...savedBase,
  }),
]);

// Books brought over from another site that the reader wants to read, as
// that site has them, to be found in the catalogue
export const wantedSchema = importBatch(
  z.object({
    title: z.string().trim().min(1).max(300),
    authors: list(z.string().trim().max(200), 20, 'That’s a lot of authors.'),
    isbn: optionalText(20),
  }),
);
