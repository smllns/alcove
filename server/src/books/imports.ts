import { Router, type Request } from 'express';
import { currentUser } from '../auth/middleware.js';
import { rememberAdded } from '../catalogue/repository.js';
import { parseBody } from '../lib/validation.js';
import { unwantImport } from '../lists/wanted.js';
import { workOf, worksByIsbns } from '../lookup/byIsbn.js';
import type { WorkResult } from '../lookup/openLibrary.js';
import { deleteCovers } from '../uploads/storage.js';
import { addBooks, deleteBooksWhere, lastImport, sameBooks } from './bulk.js';
import { bookInputSchema, importSchema, type BookInput } from './schemas.js';

// Books brought over from another site (Goodreads, StoryGraph): a batch at
// a time, and the latest import undone; and every book taken off at once.
// Part of booksRouter.
export const importsRouter = Router();

const me = (req: Request) => currentUser(req)._id;

// Books taken off together, the photos of their covers uploaded with them;
// how many went
async function takeOff(req: Request, where?: { importId: string }) {
  const { deleted, covers } = await deleteBooksWhere(me(req), where);
  await deleteCovers(covers).catch(() => {});
  return deleted;
}

// A book brought over, with what the catalogue knows of it, if it was
// found there: its work, and its cover and year where the file had none
const withWork = (input: BookInput, work: WorkResult | null): BookInput =>
  work
    ? {
        ...input,
        openLibrary: { ...input.openLibrary, work: work.workKey },
        cover:
          input.cover ??
          (work.coverUrl
            ? { url: work.coverUrl, source: 'openlibrary' }
            : undefined),
        firstPublishedYear: input.firstPublishedYear ?? work.firstPublishYear,
      }
    : input;

// Books brought over from another site (Goodreads, StoryGraph), a batch at
// a time: each one checked as a book added by hand is, found in the
// catalogue by its ISBN (its work and cover taken from there; one not
// found comes as the file has it), and added unless it's already on the
// shelves (or it isn't a book we can take). How many were added, left as
// already there, turned away, and added as they were, not found.
importsRouter.post('/import', async (req, res) => {
  const { books, importId } = parseBody(importSchema, req.body);
  const parsed = books.map((each) => bookInputSchema.safeParse(each));
  // The whole batch looked up at once
  const found = await worksByIsbns(
    parsed.map((each) => (each.success ? each.data.isbn : undefined)),
  );
  // Nothing of the reader's own to point at: no place, no lists
  const inputs = parsed.flatMap((each) =>
    each.success
      ? [
          withWork(
            {
              ...each.data,
              lists: [],
              copy: each.data.copy && { ...each.data.copy, place: undefined },
            },
            workOf(found, each.data.isbn),
          ),
        ]
      : [],
  );
  const there = await sameBooks(me(req), inputs);
  const coming = inputs.filter((_, i) => !there[i]);
  await addBooks(me(req), coming, importId);
  await rememberAdded(coming);
  res.json({
    added: coming.length,
    skipped: inputs.length - coming.length,
    failed: parsed.length - inputs.length,
    unfound: coming.filter((input) => !input.openLibrary?.work).length,
  });
});

// The latest import from another site, if any, and undoing it: its books
// taken off the shelves, and what it put in the lists taken out
importsRouter.get('/imports/last', async (req, res) => {
  res.json({ last: await lastImport(me(req)) });
});
importsRouter.delete('/imports/:id', async (req, res) => {
  const id = String(req.params.id);
  const deleted = await takeOff(req, { importId: id });
  const unlisted = await unwantImport(me(req), id);
  res.json({ deleted, unlisted });
});

// Every book taken off the shelves at once (the lists and places stay,
// only without them), photos of covers uploaded with them
importsRouter.delete('/', async (req, res) => {
  res.json({ deleted: await takeOff(req) });
});
