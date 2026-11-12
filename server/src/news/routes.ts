import { Router, type RequestHandler } from 'express';
import { z } from 'zod';
import { currentUser } from '../auth/middleware.js';
import { HttpError } from '../lib/errors.js';
import { objectIdOr, parseBody } from '../lib/validation.js';
import {
  isAdmin,
  latestNews,
  rewriteNews,
  unpublishNews,
  writeNews,
} from './repository.js';

// alcove's news: read by anyone signed in; written, changed and taken
// down only by those who run alcove

export const newsRouter = Router();

const adminOnly: RequestHandler = (req, _res, next) => {
  if (!isAdmin(currentUser(req)))
    throw new HttpError(403, 'not_admin', 'Only alcove’s team writes news.');
  next();
};

const newsSchema = z.object({
  title: z.string().trim().min(1, 'Give it a headline.').max(120),
  body: z.string().trim().min(1, 'Say a few words.').max(1000),
  // A way on: a page of the app (/library/places) or the web
  link: z
    .object({
      label: z.string().trim().min(1, 'Name the way on.').max(40),
      to: z
        .string()
        .trim()
        .regex(/^(\/|https:\/\/)/, 'A page of alcove (/…) or a web address.')
        .max(500),
    })
    .optional(),
});

const noSuchNews = () =>
  new HttpError(404, 'not_found', 'There’s no such news.');
const idOf = (raw: unknown) => objectIdOr(raw, noSuchNews);

newsRouter.get('/', async (_req, res) => {
  res.json({ news: await latestNews() });
});

newsRouter.post('/', adminOnly, async (req, res) => {
  res
    .status(201)
    .json({ news: await writeNews(parseBody(newsSchema, req.body)) });
});

newsRouter.put('/:id', adminOnly, async (req, res) => {
  const done = await rewriteNews(
    idOf(req.params.id),
    parseBody(newsSchema, req.body),
  );
  if (!done) throw noSuchNews();
  res.json({ news: done });
});

newsRouter.delete('/:id', adminOnly, async (req, res) => {
  if (!(await unpublishNews(idOf(req.params.id)))) throw noSuchNews();
  res.status(204).end();
});
