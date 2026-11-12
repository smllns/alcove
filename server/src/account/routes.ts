import { Router } from 'express';
import { ObjectId } from 'mongodb';
import { currentUser } from '../auth/middleware.js';
import { endAllSessions, endOtherSessions } from '../auth/sessions.js';
import {
  deleteUser,
  toPublicUser,
  updateUser,
  usernameTaken,
} from '../auth/users.js';
import { deleteAllBooks } from '../books/repository.js';
import { books, type UserDoc } from '../db.js';
import { HttpError } from '../lib/errors.js';
import { hashPassword, verifyPassword } from '../lib/password.js';
import { passwordAttempts } from '../lib/rateLimit.js';
import { parseBody } from '../lib/validation.js';
import { deleteLists } from '../lists/repository.js';
import { deletePlaces } from '../places/repository.js';
import { deleteFollows, letAllIn } from '../users/follows.js';
import { forgetReader } from '../users/activity.js';
import { deleteLikes } from '../users/reviewLikes.js';
import { privacyOf } from '../users/privacy.js';
import {
  deleteAllCovers,
  discardCover,
  isOwnCover,
} from '../uploads/storage.js';
import {
  aboutSchema,
  favouritesSchema,
  avatarSchema,
  deleteSchema,
  emailSchema,
  nameSchema,
  passwordSchema,
  privacySchema,
  usernameSchema,
} from './schemas.js';

// Everything a signed-in reader can change about their own account.
// Mounted behind requireUser, so req.user is always set.
export const accountRouter = Router();

// Sensitive changes need the password again, even with a valid session
async function confirmPassword(user: UserDoc, password: string, field: string) {
  if (!(await verifyPassword(password, user.passwordHash))) {
    throw new HttpError(400, 'wrong_password', 'That password isn’t right.', {
      [field]: 'That password isn’t right.',
    });
  }
}

const emailTaken = () =>
  new HttpError(409, 'email_taken', 'That email already has an account.', {
    email: 'That email already has an account.',
  });

accountRouter.patch('/name', async (req, res) => {
  const { name } = parseBody(nameSchema, req.body);
  const user = await updateUser(currentUser(req)._id, { name });
  res.json({ user: toPublicUser(user!) });
});

accountRouter.patch('/about', async (req, res) => {
  const { about } = parseBody(aboutSchema, req.body);
  const user = await updateUser(currentUser(req)._id, { about });
  res.json({ user: toPublicUser(user!) });
});

// Their photo changed, or taken away; the one before thrown away
accountRouter.patch('/avatar', async (req, res) => {
  const { url } = parseBody(avatarSchema, req.body);
  const me = currentUser(req);
  if (url && !isOwnCover(me._id, url))
    throw new HttpError(400, 'not_yours', 'Upload the photo here first.');
  const user = await updateUser(me._id, { avatarUrl: url ?? '' });
  if (me.avatarUrl && me.avatarUrl !== url)
    await discardCover(me._id, me.avatarUrl).catch(() => {});
  res.json({ user: toPublicUser(user!) });
});

// Their favourite books, chosen among their own
accountRouter.patch('/favourites', async (req, res) => {
  const ids = parseBody(favouritesSchema, req.body).books.map(
    (id) => new ObjectId(id),
  );
  const me = currentUser(req);
  const theirs = await books().countDocuments({
    _id: { $in: ids },
    userId: me._id,
  });
  if (theirs !== ids.length)
    throw new HttpError(400, 'not_yours', 'Choose from your own books.');
  const user = await updateUser(me._id, { favourites: ids });
  res.json({ user: toPublicUser(user!) });
});

// Who sees what; a page opened to everyone lets in all who were asking
accountRouter.patch('/privacy', async (req, res) => {
  const change = parseBody(privacySchema, req.body);
  const me = currentUser(req);
  const privacy = { ...privacyOf(me), ...change };
  const user = await updateUser(me._id, { privacy });
  if (change.page === 'open') await letAllIn(me._id);
  res.json({ user: toPublicUser(user!) });
});

accountRouter.patch('/username', async (req, res) => {
  const { username } = parseBody(usernameSchema, req.body);
  const user = await updateUser(currentUser(req)._id, { username });
  if (!user) throw usernameTaken('That username is taken.');
  res.json({ user: toPublicUser(user) });
});

accountRouter.patch('/email', passwordAttempts, async (req, res) => {
  const { email, password } = parseBody(emailSchema, req.body);
  await confirmPassword(currentUser(req), password, 'password');
  const user = await updateUser(currentUser(req)._id, { email });
  if (!user) throw emailTaken();
  res.json({ user: toPublicUser(user) });
});

accountRouter.patch('/password', passwordAttempts, async (req, res) => {
  const { currentPassword, newPassword } = parseBody(passwordSchema, req.body);
  const me = currentUser(req);
  await confirmPassword(me, currentPassword, 'currentPassword');
  await updateUser(me._id, { passwordHash: await hashPassword(newPassword) });
  // Anyone holding an old session elsewhere is signed out; this device stays in
  await endOtherSessions(me._id, req.sessionId!);
  res.status(204).end();
});

accountRouter.delete('/', passwordAttempts, async (req, res) => {
  const { password } = parseBody(deleteSchema, req.body);
  const me = currentUser(req);
  await confirmPassword(me, password, 'password');
  await endAllSessions(res, me._id);
  // Their hearts, and those on their reviews, while their books still say
  // which those are; then their books and photos go with them: the photos
  // last, once nothing of theirs uses them (those another reader added
  // with a book stay)
  await Promise.all([deleteLikes(me._id), forgetReader(me._id)]);
  await Promise.all([
    deleteAllBooks(me._id),
    deletePlaces(me._id),
    deleteLists(me._id),
    deleteFollows(me._id),
  ]);
  await deleteUser(me._id);
  await deleteAllCovers(me._id).catch(() => {});
  res.status(204).end();
});
