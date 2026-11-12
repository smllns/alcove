import { Router } from 'express';
import { sharedAbout } from '../users/sharedBooks.js';
import { cached } from './cache.js';
import { noneIfMissing, workKeyOf } from './params.js';
import { workDetails } from './workDoc.js';

export const aboutRouter = Router();

// What the book is about and its genres; where the catalogue doesn't say
// what it's about, what a reader of alcove wrote of it (said to be
// theirs: `from`), or else nothing; and a cover a reader of alcove gave
// it, if any did (`readersCover`), for a copy with none of its own
aboutRouter.get('/works/:workKey', async (req, res) => {
  const workKey = workKeyOf(req);
  const [details, theirs] = await Promise.all([
    cached(`about2:${workKey}`, 30, () =>
      workDetails(workKey).catch(noneIfMissing),
    ),
    sharedAbout(workKey),
  ]);
  const known = details ?? { description: null, genres: [] };
  res.json({
    ...known,
    ...(!known.description &&
      theirs.description && {
        description: theirs.description,
        from: 'readers',
      }),
    ...(theirs.cover && { readersCover: theirs.cover.url }),
  });
});
