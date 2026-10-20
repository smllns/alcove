import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { HttpError } from '../lib/errors.js';
import { cached } from './cache.js';
import {
  cleanIsbn,
  editionByIsbn,
  looksLikeIsbn,
  searchWorks,
  WORK_KEY,
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
    isbnEdition = await cached(`isbn2:${cleanIsbn(query)}`, 30, () =>
      editionByIsbn(query),
    ).catch(() => null);
  }
  res.json({ results, isbnEdition });
});

lookupRouter.get('/works/:workKey/editions', async (req, res) => {
  const { workKey } = req.params;
  if (!WORK_KEY.test(workKey))
    throw new HttpError(400, 'bad_work', 'That isn’t a book we know.');
  const editions = await cached(`editions2:${workKey}`, 7, () =>
    workEditions(workKey),
  );
  res.json({ editions });
});
