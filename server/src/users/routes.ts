import { Router, type Request } from 'express';
import { currentUser } from '../auth/middleware.js';
import { users } from '../db.js';
import { HttpError } from '../lib/errors.js';
import { queryText } from '../lib/validation.js';
import { answer, follow, people, unfollow } from './follows.js';
import { readerPage, sightOf } from './profile.js';
import { readerBook } from './readerBook.js';
import { feedOf } from './feed.js';
import { heartsOnMine, likeReview } from './reviewLikes.js';
import { readersReviews } from './reviews.js';
import { sharedBooksBy } from './sharedBooks.js';
import { searchReaders } from './repository.js';

// Other readers, as far as they can be seen: found by name, their pages
// opened, followed and no longer followed; and those asking to follow the
// reader let in or turned away. Mounted behind requireUser.
export const usersRouter = Router();

usersRouter.get('/search', async (req, res) => {
  const query = queryText(req, 'q', 60);
  res.json({ readers: await searchReaders(query, currentUser(req)._id) });
});

const USERNAME = /^[a-z0-9_]{3,20}$/;

// The reader a request names, or a 404
async function named(req: Request) {
  const username = String(req.params.username ?? '').toLowerCase();
  const user = USERNAME.test(username)
    ? await users().findOne({ username })
    : null;
  if (!user) throw new HttpError(404, 'not_found', 'There’s no such reader.');
  return user;
}

usersRouter.get('/readers/:username', async (req, res) => {
  res.json({
    reader: await readerPage(await named(req), currentUser(req)._id),
  });
});

usersRouter.post('/readers/:username/follow', async (req, res) => {
  const me = currentUser(req)._id;
  const reader = await named(req);
  if (reader._id.equals(me))
    throw new HttpError(400, 'own_page', 'That’s you.');
  res.json({ follow: await follow(me, reader) });
});

usersRouter.delete('/readers/:username/follow', async (req, res) => {
  await unfollow(currentUser(req)._id, (await named(req))._id);
  res.json({ follow: 'none' });
});

// Who follow a reader, and who they follow: for those who may open their
// page
usersRouter.get('/readers/:username/:side', async (req, res) => {
  const side = req.params.side;
  if (side !== 'followers' && side !== 'following')
    throw new HttpError(404, 'not_found', 'Not found.');
  const reader = await named(req);
  if (!(await sightOf(reader, currentUser(req)._id)).open)
    throw new HttpError(403, 'closed', 'Only their followers see that.');
  res.json({ readers: await people(reader._id, side) });
});

// A writer's books as other readers have them in alcove: ?name=
usersRouter.get('/books-by', async (req, res) => {
  const name = queryText(req, 'name', 120);
  res.json({ works: await sharedBooksBy(name, currentUser(req)._id) });
});

// What other readers wrote of a book: ?work= (its work in the catalogue),
// &title= and &author=
usersRouter.get('/reviews', async (req, res) => {
  res.json({
    reviews: await readersReviews(
      {
        work: queryText(req, 'work', 40) || undefined,
        title: queryText(req, 'title', 300),
        author: queryText(req, 'author', 120) || undefined,
      },
      currentUser(req)._id,
    ),
  });
});

// The reader's feed: what those they follow did, and what was done for
// them, with how many are new since they last looked
usersRouter.get('/feed', async (req, res) => {
  const me = currentUser(req);
  res.json(await feedOf(me._id, me.feedSeenAt));
});

// The feed looked at: nothing in it new any more
usersRouter.post('/feed/seen', async (req, res) => {
  await users().updateOne(
    { _id: currentUser(req)._id },
    { $set: { feedSeenAt: new Date() } },
  );
  res.status(204).end();
});

// Who gave their hearts to the reader's own review, the latest first
usersRouter.get('/reviews/:id/hearts', async (req, res) => {
  res.json(await heartsOnMine(String(req.params.id), currentUser(req)._id));
});

// A heart on another reader's review, or taken back
usersRouter.post('/reviews/:id/like', async (req, res) => {
  await likeReview(String(req.params.id), currentUser(req)._id, true);
  res.status(204).end();
});
usersRouter.delete('/reviews/:id/like', async (req, res) => {
  await likeReview(String(req.params.id), currentUser(req)._id, false);
  res.status(204).end();
});

// One of another reader's books the catalogue doesn't know, as far as
// they let it be seen
usersRouter.get('/books/:id', async (req, res) => {
  const work = await readerBook(String(req.params.id), currentUser(req)._id);
  if (!work) throw new HttpError(404, 'not_found', 'There’s no such book.');
  res.json({ work });
});

// Those asking to follow the reader, and each let in or turned away
usersRouter.get('/asking', async (req, res) => {
  res.json({ readers: await people(currentUser(req)._id, 'asking') });
});
usersRouter.post('/asking/:username', async (req, res) => {
  const yes = req.body?.yes === true;
  const found = await answer(currentUser(req)._id, (await named(req))._id, yes);
  if (!found) throw new HttpError(404, 'not_found', 'They aren’t asking.');
  res.status(204).end();
});
