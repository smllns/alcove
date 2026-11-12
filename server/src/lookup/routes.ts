import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { HttpError } from '../lib/errors.js';
import { queryText } from '../lib/validation.js';
import { currentUser } from '../auth/middleware.js';
import { ownCopies } from '../books/repository.js';
import { cached } from './cache.js';
import { titleKey } from '../lib/text.js';
import { sharedBooksMatching } from '../users/sharedBooks.js';
import { listRouter } from './listRoutes.js';
import { noneIfMissing, workKeyOf } from './params.js';
import { listsOfWork } from './workLists.js';
import { similarWorks } from './similar.js';
import { aboutRouter } from './aboutRoutes.js';
import { authorRouter } from './authorRoutes.js';
import { searchAuthors } from './authors.js';
import { workSummary } from './work.js';
import { featuredWith } from './featured.js';
import { bookQuotes } from './wikiquote.js';
import {
  ourEdition,
  rememberFound,
  searchOurs,
  type OurEdition,
} from '../catalogue/repository.js';
import { editionByIsbn, workEditions } from './editions.js';
import { cleanIsbn, looksLikeIsbn, searchWorks } from './openLibrary.js';
import { workRatings } from './workDoc.js';
import { alcoveStars, blended } from './alcoveRatings.js';

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

// The lists every reader sees, and readers' lists on Open Library
lookupRouter.use(listRouter);
// Who wrote a book
lookupRouter.use(authorRouter);
// What a book is about
lookupRouter.use(aboutRouter);

lookupRouter.get('/search', async (req, res) => {
  const query = String(req.query.q ?? '').trim();
  if (query.length < 2) {
    res.json({ results: [], isbnEdition: null, ours: [] });
    return;
  }
  const key = query.toLowerCase();
  const works = () => cached(`search9:${key}`, 3, () => searchWorks(query));
  const isIsbn = looksLikeIsbn(query);

  // Open Library's works, and for words alcove's own, asked for at once:
  // printings readers added that Open Library doesn't know, and books other
  // readers keep that the catalogue doesn't know (after its own, each with
  // all that's said of it)
  const [found, printings, shared] = await Promise.all([
    works(),
    isIsbn ? [] : searchOurs(query),
    isIsbn
      ? []
      : sharedBooksMatching(query, currentUser(req)._id).catch(() => []),
  ]);
  let ours: OurEdition[] = printings;
  // An ISBN points at one exact edition; fetch it so the form can use it as
  // is, and keep it in alcove's own catalogue; and for one it doesn't know,
  // the printing a reader added
  let isbnEdition = null;
  if (isIsbn) {
    isbnEdition = await cached(`isbn3:${cleanIsbn(query)}`, 30, () =>
      editionByIsbn(query),
    ).catch(() => null);
    if (isbnEdition)
      await rememberFound([
        { ...isbnEdition, isbn: isbnEdition.isbn ?? query },
      ]);
    const edition = found.length ? null : await ourEdition(query);
    ours = edition ? [edition] : [];
  }
  const known = new Set(found.map((work) => titleKey(work.title)));
  const results = [
    ...found,
    ...shared.filter((work) => !known.has(titleKey(work.title))),
  ];
  res.json({ results, isbnEdition, ours });
});

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

// A work in short (title, writers, cover), for its page opened directly
lookupRouter.get('/works/:workKey/summary', async (req, res) => {
  const workKey = workKeyOf(req);
  res.json({
    work: await cached(`worksummary5:${workKey}`, 7, () =>
      workSummary(workKey),
    ),
  });
});

// How readers rate it: the catalogue's (kept for days, not weeks, as
// ratings come in all the time) and alcove's (as they are now), together
lookupRouter.get('/works/:workKey/ratings', async (req, res) => {
  const workKey = workKeyOf(req);
  const [theirs, ours] = await Promise.all([
    cached(`ratings1:${workKey}`, 3, () =>
      workRatings(workKey).catch(noneIfMissing),
    ),
    alcoveStars([workKey]),
  ]);
  res.json({ ratings: blended(theirs, ours.get(workKey)) });
});

// The lists every reader sees that the book is in
lookupRouter.get('/works/:workKey/featured', async (req, res) => {
  res.json({ lists: await featuredWith(workKeyOf(req)) });
});

// Lists on Open Library the book is in (workLists.ts)
lookupRouter.get('/works/:workKey/lists', async (req, res) => {
  res.json(await listsOfWork(workKeyOf(req)));
});

// Books to read next: on the same themes, and by the same author. The
// catalogue's answer is kept for all readers; which of the books are on
// this reader's shelves already is looked up afresh, with their ids and
// the stars the reader gave them.
lookupRouter.get('/works/:workKey/similar', async (req, res) => {
  const workKey = workKeyOf(req);
  const similar = (await cached(`similar8:${workKey}`, 7, () =>
    similarWorks(workKey).catch(noneIfMissing),
  )) ?? { alike: [], byAuthor: [] };
  const keys = [...similar.alike, ...similar.byAuthor].map((w) => w.workKey);
  const owned = await ownCopies(currentUser(req)._id, keys);
  const withShelf = (list: typeof similar.alike) =>
    list.map((work) => ({ ...work, ...owned.get(work.workKey) }));
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
