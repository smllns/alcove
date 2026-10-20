import type { Request, RequestHandler } from 'express';
import { HttpError } from '../lib/errors.js';
import { readSession, SESSION_COOKIE } from './sessions.js';
import { findUserById } from './users.js';
import type { UserDoc } from '../db.js';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: UserDoc;
      // Id of the session behind this request, when signed in
      sessionId?: string;
    }
  }
}

// Puts the signed-in user (if any) on req.user
export const loadUser: RequestHandler = async (req, res, next) => {
  const token: unknown = req.cookies?.[SESSION_COOKIE];
  if (typeof token === 'string' && token) {
    const session = await readSession(token, res);
    if (session) {
      req.user = (await findUserById(session.userId)) ?? undefined;
      req.sessionId = session._id;
    }
  }
  next();
};

// The signed-in user, in a route mounted behind requireUser
export const currentUser = (req: Request) => req.user as UserDoc;

export const requireUser: RequestHandler = (req, _res, next) => {
  if (!req.user)
    throw new HttpError(401, 'unauthenticated', 'Please log in first.');
  next();
};
