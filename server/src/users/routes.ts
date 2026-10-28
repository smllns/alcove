import { Router } from 'express';
import { currentUser } from '../auth/middleware.js';
import { queryText } from '../lib/validation.js';
import { searchReaders } from './repository.js';

// Other readers, as far as they can be seen. Mounted behind requireUser.
export const usersRouter = Router();

usersRouter.get('/search', async (req, res) => {
  const query = queryText(req, 'q', 60);
  res.json({ readers: await searchReaders(query, currentUser(req)._id) });
});
