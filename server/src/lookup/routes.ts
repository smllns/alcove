import { Router, type Request } from 'express';
import { rateLimit } from 'express-rate-limit';
import { HttpError } from '../lib/errors.js';
import { queryText } from '../lib/validation.js';
import { currentUser } from '../auth/middleware.js';
import { shelvedWorks } from '../books/repository.js';
import { cached } from './cache.js';
import { listsOfWork } from './lists.js';
import { similarWorks } from './similar.js';
import { workAuthor } from './author.js';
import { searchAuthors } from './authors.js';
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

// Writers by name, for the search over everything
lookupRouter.get('/authors', async (req, res) => {
  const query = queryText(req, 'q', 100);
  if (query.length < 2) {
    res.json({ authors: [] });
    return;
  }
  const authors = await cached(`authors1:${query.toLowerCase()}`, 7, () =>
    searchAuthors(query),
  );
  res.json({ authors });
});

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

// Who wrote the book: name, years, picture and a few lines about them
lookupRouter.get('/works/:workKey/author', async (req, res) => {
  const workKey = workKeyOf(req);
  const author = await cached(`author3:${workKey}`, 30, () =>
    workAuthor(workKey).catch(noneIfMissing),
  );
  res.json({ author });
});

// Lists on Open Library the book is in (lists.ts)
lookupRouter.get('/works/:workKey/lists', async (req, res) => {
  res.json(await listsOfWork(workKeyOf(req)));
});

// Books to read next: on the same themes, and by the same author. The
// catalogue's answer is kept for all readers; which of the books are on
// this reader's shelves already is looked up afresh, with their ids.
lookupRouter.get('/works/:workKey/similar', async (req, res) => {
  const workKey = workKeyOf(req);
  const similar = (await cached(`similar4:${workKey}`, 7, () =>
    similarWorks(workKey).catch(noneIfMissing),
  )) ?? { alike: [], byAuthor: [] };
  const keys = [...similar.alike, ...similar.byAuthor].map((w) => w.workKey);
  const owned = await shelvedWorks(currentUser(req)._id, keys);
  const withShelf = (list: typeof similar.alike) =>
    list.map((work) => ({ ...work, bookId: owned.get(work.workKey) }));
  res.json({
    alike: withShelf(similar.alike),
    byAuthor: withShelf(similar.byAuthor),
  });
});

// Lines from the book, from Wikiquote, to keep among the reader's own
// quotes. Nothing found is an answer too; only a failure isn't kept.
lookupRouter.get('/quotes', async (req, res) => {
  const title = queryText(req, 'title', 300);
  const author = queryText(req, 'author', 120);
  if (!title) {
    res.json({ quotes: [], source: null });
    return;
  }
  const key = `${title}|${author}`.toLowerCase();
  res.json(await cached(`quotes1:${key}`, 30, () => bookQuotes(title, author)));
});
