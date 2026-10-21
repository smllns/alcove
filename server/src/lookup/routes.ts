import { Router, type Request } from 'express';
import { rateLimit } from 'express-rate-limit';
import { HttpError } from '../lib/errors.js';
import { cached } from './cache.js';
import { bookQuotes } from './wikiquote.js';
import {
  cleanIsbn,
  editionByIsbn,
  looksLikeIsbn,
  searchWorks,
  WORK_KEY,
  workDetails,
  workRatings,
  workEditions,
} from './openLibrary.js';

// Finding books to add: search the catalogue, then pick an edition.
// Mounted behind requireUser.
export const lookupRouter = Router();

// Typing searches as you go; this stops a runaway client, not a person
lookupRouter.use(
  rateLimit({
    windowMs: 60 * 1000,
    limit: 90,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    handler: (_req, _res, next) =>
      next(
        new HttpError(
          429,
          'too_many_lookups',
          'Searching a little too fast. Give it a second.',
        ),
      ),
  }),
);

lookupRouter.get('/search', async (req, res) => {
  const query = String(req.query.q ?? '').trim();
  if (query.length < 2) {
    res.json({ results: [], isbnEdition: null });
    return;
  }
  const key = query.toLowerCase();

  const results = await cached(`search4:${key}`, 3, () => searchWorks(query));

  // An ISBN points at one exact edition; fetch it so the form can use it as is
  let isbnEdition = null;
  if (looksLikeIsbn(query)) {
    isbnEdition = await cached(`isbn3:${cleanIsbn(query)}`, 30, () =>
      editionByIsbn(query),
    ).catch(() => null);
  }
  res.json({ results, isbnEdition });
});

const workKeyOf = (req: Request) => {
  const { workKey } = req.params;
  if (typeof workKey !== 'string' || !WORK_KEY.test(workKey))
    throw new HttpError(400, 'bad_work', 'That isn’t a book we know.');
  return workKey;
};

lookupRouter.get('/works/:workKey/editions', async (req, res) => {
  const workKey = workKeyOf(req);
  const editions = await cached(`editions4:${workKey}`, 7, () =>
    workEditions(workKey),
  );
  res.json({ editions });
});

// A book the catalogue doesn't have says nothing, rather than failing
const noneIfMissing = (err: unknown) => {
  if (err instanceof HttpError && err.status === 404) return null;
  throw err;
};

// What the book is about and its genres; nothing when the catalogue
// doesn't say
lookupRouter.get('/works/:workKey', async (req, res) => {
  const workKey = workKeyOf(req);
  const details = await cached(`about2:${workKey}`, 30, () =>
    workDetails(workKey).catch(noneIfMissing),
  );
  res.json(details ?? { description: null, genres: [] });
});

// How the catalogue's readers rate it. Ratings come in all the time, so
// they're kept for days, not weeks.
lookupRouter.get('/works/:workKey/ratings', async (req, res) => {
  const workKey = workKeyOf(req);
  const ratings = await cached(`ratings1:${workKey}`, 3, () =>
    workRatings(workKey).catch(noneIfMissing),
  );
  res.json({ ratings });
});

// Lines from the book, from Wikiquote, to keep among the reader's own
// quotes. Nothing found is an answer too; only a failure isn't kept.
lookupRouter.get('/quotes', async (req, res) => {
  const title = String(req.query.title ?? '')
    .trim()
    .slice(0, 300);
  const author = String(req.query.author ?? '')
    .trim()
    .slice(0, 120);
  if (!title) {
    res.json({ quotes: [], source: null });
    return;
  }
  const key = `${title}|${author}`.toLowerCase();
  res.json(await cached(`quotes1:${key}`, 30, () => bookQuotes(title, author)));
});
