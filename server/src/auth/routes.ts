import { Router } from 'express';
import { HttpError } from '../lib/errors.js';
import { passwordAttempts } from '../lib/rateLimit.js';
import { parseBody } from '../lib/validation.js';
import {
  hashPassword,
  spendPasswordTime,
  verifyPassword,
} from '../lib/password.js';
import { requireUser } from './middleware.js';
import { loginSchema, registerSchema } from './schemas.js';
import { endSession, SESSION_COOKIE, startSession } from './sessions.js';
import {
  createUser,
  findUserByEmail,
  toPublicUser,
  usernameTaken,
} from './users.js';

export const authRouter = Router();

authRouter.post('/register', passwordAttempts, async (req, res) => {
  const { username, email, password } = parseBody(registerSchema, req.body);

  const { user, taken } = await createUser({
    username,
    email,
    passwordHash: await hashPassword(password),
  });
  if (taken === 'username')
    throw usernameTaken('Someone has this one already. Try another.');
  if (!user) {
    throw new HttpError(
      409,
      'email_taken',
      'An account with this email already exists.',
      {
        email: 'This email already has an account. Try logging in.',
      },
    );
  }

  await startSession(res, user._id);
  res.status(201).json({ user: toPublicUser(user) });
});

authRouter.post('/login', passwordAttempts, async (req, res) => {
  const { email, password } = parseBody(loginSchema, req.body);

  const user = await findUserByEmail(email);
  let ok = false;
  if (user) ok = await verifyPassword(password, user.passwordHash);
  else await spendPasswordTime(password);

  // Same answer, and roughly the same delay, for a wrong email and a wrong password
  if (!user || !ok) {
    throw new HttpError(
      401,
      'invalid_credentials',
      'That email and password don’t match.',
    );
  }

  await startSession(res, user._id);
  res.json({ user: toPublicUser(user) });
});

authRouter.post('/logout', async (req, res) => {
  await endSession(res, req.cookies?.[SESSION_COOKIE]);
  res.status(204).end();
});

authRouter.get('/me', requireUser, (req, res) => {
  res.json({ user: toPublicUser(req.user!) });
});
