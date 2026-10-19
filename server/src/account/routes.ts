import { Router, type Request } from 'express';
import { endAllSessions, endOtherSessions } from '../auth/sessions.js';
import { deleteUser, toPublicUser, updateUser } from '../auth/users.js';
import type { UserDoc } from '../db.js';
import { HttpError } from '../lib/errors.js';
import { hashPassword, verifyPassword } from '../lib/password.js';
import { passwordAttempts } from '../lib/rateLimit.js';
import { parseBody } from '../lib/validation.js';
import {
  deleteSchema,
  emailSchema,
  nameSchema,
  passwordSchema,
} from './schemas.js';

// Everything a signed-in reader can change about their own account.
// Mounted behind requireUser, so req.user is always set.
export const accountRouter = Router();

const currentUser = (req: Request) => req.user as UserDoc;

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
  await deleteUser(me._id);
  res.status(204).end();
});
