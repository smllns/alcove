import { Router, type Request } from 'express';
import { currentUser } from '../auth/middleware.js';
import { parseBody } from '../lib/validation.js';
import { countByPlace, getPlaces, savePlaces } from './repository.js';
import { placesSchema } from './schemas.js';

// The reader's homes, rooms, bookcases and shelves. Mounted behind
// requireUser.
export const placesRouter = Router();

const me = (req: Request) => currentUser(req)._id;

placesRouter.get('/', async (req, res) => {
  const [homes, counts] = await Promise.all([
    getPlaces(me(req)),
    countByPlace(me(req)),
  ]);
  res.json({ homes, counts });
});

// Replaces the whole tree; small enough that this is simpler than editing
// it piece by piece
placesRouter.put('/', async (req, res) => {
  const { homes, created } = await savePlaces(
    me(req),
    parseBody(placesSchema, req.body),
  );
  res.json({ homes, counts: await countByPlace(me(req)), created });
});
