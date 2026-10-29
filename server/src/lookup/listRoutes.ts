import { Router, type Request } from 'express';
import { HttpError } from '../lib/errors.js';
import { queryText } from '../lib/validation.js';
import { featured, featuredList } from './featured.js';
import {
  checkReadersList,
  LIST_ID,
  OWNER,
  readersList,
  searchReadersLists,
} from './readersLists.js';

// Lists of books from Open Library: those every reader sees, and those
// readers have made there. Mounted inside the lookups (routes.ts), behind
// their limit.
export const listRouter = Router();

// The lists every reader sees under their own, and one of them with its
// books
listRouter.get('/featured', (_req, res) => {
  res.json({ lists: featured });
});
listRouter.get('/featured/:id', async (req, res) => {
  res.json({ list: await featuredList(String(req.params.id)) });
});

// Lists readers have made on Open Library, by name (readersLists.ts)
listRouter.get('/lists', async (req, res) => {
  const query = queryText(req, 'q', 100);
  res.json({ lists: query.length < 2 ? [] : await searchReadersLists(query) });
});

const listOf = (req: Request) => {
  const { owner, id } = req.params;
  if (
    typeof owner !== 'string' ||
    typeof id !== 'string' ||
    !OWNER.test(owner) ||
    !LIST_ID.test(id)
  )
    throw new HttpError(400, 'bad_list', 'That isn’t a list we know.');
  return { owner, id };
};

// Whether one of them can be shown here: how many books it holds, or none
listRouter.get('/lists/:owner/:id/check', async (req, res) => {
  const { owner, id } = listOf(req);
  res.json(await checkReadersList(owner, id));
});

// One of them, a page of its books at a time
listRouter.get('/lists/:owner/:id', async (req, res) => {
  const { owner, id } = listOf(req);
  const page = Math.min(Math.max(Number(req.query.page) || 0, 0), 100);
  res.json({ list: await readersList(owner, id, page) });
});
