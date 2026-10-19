import { createHash, randomBytes } from 'node:crypto';
import type { CookieOptions, Response } from 'express';
import type { ObjectId } from 'mongodb';
import { config } from '../config.js';
import { sessions } from '../db.js';

// Sessions are random tokens in an httpOnly cookie. Only a hash of the token
// is stored, so a leaked database can't be used to log in.
export const SESSION_COOKIE = 'alcove_session';
const SESSION_DAYS = 30;
const SESSION_MS = SESSION_DAYS * 24 * 60 * 60 * 1000;
// Sliding expiry: refresh the session at most once a day while it's in use
const REFRESH_AFTER_MS = 24 * 60 * 60 * 1000;

const hashToken = (token: string) =>
  createHash('sha256').update(token).digest('hex');

const cookieOptions: CookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: config.isProduction,
  path: '/',
};

export async function startSession(res: Response, userId: ObjectId) {
  const token = randomBytes(32).toString('base64url');
  const now = new Date();
  await sessions().insertOne({
    _id: hashToken(token),
    userId,
    createdAt: now,
    expiresAt: new Date(now.getTime() + SESSION_MS),
  });
  res.cookie(SESSION_COOKIE, token, { ...cookieOptions, maxAge: SESSION_MS });
}

// The session for a cookie token, if it's still valid
export async function readSession(token: string, res: Response) {
  const id = hashToken(token);
  const session = await sessions().findOne({ _id: id });
  if (!session || session.expiresAt.getTime() <= Date.now()) return null;

  const age = SESSION_MS - (session.expiresAt.getTime() - Date.now());
  if (age > REFRESH_AFTER_MS) {
    const expiresAt = new Date(Date.now() + SESSION_MS);
    await sessions().updateOne({ _id: id }, { $set: { expiresAt } });
    res.cookie(SESSION_COOKIE, token, { ...cookieOptions, maxAge: SESSION_MS });
  }
  return session;
}

export async function endSession(res: Response, token: string | undefined) {
  if (token) await sessions().deleteOne({ _id: hashToken(token) });
  res.clearCookie(SESSION_COOKIE, cookieOptions);
}

// Signs every other device out, e.g. after a password change
export async function endOtherSessions(userId: ObjectId, keepId: string) {
  await sessions().deleteMany({ userId, _id: { $ne: keepId } });
}

export async function endAllSessions(res: Response, userId: ObjectId) {
  await sessions().deleteMany({ userId });
  res.clearCookie(SESSION_COOKIE, cookieOptions);
}
