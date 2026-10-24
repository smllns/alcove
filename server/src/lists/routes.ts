import { Router, type Request } from 'express';
import { currentUser } from '../auth/middleware.js';
import { HttpError } from '../lib/errors.js';
import { parseBody } from '../lib/validation.js';
import {
  countByList,
  createList,
  deleteList,
  getLists,
  renameList,
} from './repository.js';
import { listNameSchema } from './schemas.js';

// The reader's own lists of books. Mounted behind requireUser.
export const listsRouter = Router();

const me = (req: Request) => currentUser(req)._id;

const TAKEN = 'You have a list by that name.';
const nameTaken = () =>
  new HttpError(409, 'list_name_taken', TAKEN, { name: TAKEN });

const noSuchList = () =>
  new HttpError(404, 'list_not_found', 'That list isn’t there any more.');

// Every list, with how many books are in each
const everything = async (req: Request) => {
  const [lists, counts] = await Promise.all([
    getLists(me(req)),
    countByList(me(req)),
  ]);
  return { lists, counts };
};

listsRouter.get('/', async (req, res) => {
  res.json(await everything(req));
});

listsRouter.post('/', async (req, res) => {
  const { name } = parseBody(listNameSchema, req.body);
  const list = await createList(me(req), name);
  if (!list)
    throw new HttpError(
      409,
      'too_many_lists',
      'That’s a lot of lists. Remove one first.',
    );
  res.status(201).json({ list, ...(await everything(req)) });
});

listsRouter.patch('/:id', async (req, res) => {
  const { name } = parseBody(listNameSchema, req.body);
  const result = await renameList(me(req), req.params.id, name);
  if (result === 'missing') throw noSuchList();
  if (result === 'taken') throw nameTaken();
  res.json(await everything(req));
});

listsRouter.delete('/:id', async (req, res) => {
  if (!(await deleteList(me(req), req.params.id))) throw noSuchList();
  res.json(await everything(req));
});
