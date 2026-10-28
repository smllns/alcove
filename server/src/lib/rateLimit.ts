import { rateLimit } from 'express-rate-limit';
import { config } from '../config.js';
import { HttpError } from './errors.js';

// Slows down password guessing: 20 attempts per 15 minutes per IP, for any
// route that checks a password. Not in the tests, which sign many readers
// up from one place in a moment.
export const passwordAttempts = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  skip: () => config.NODE_ENV === 'test',
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  handler: (_req, _res, next) =>
    next(
      new HttpError(
        429,
        'too_many_attempts',
        'Too many attempts. Try again in a few minutes.',
      ),
    ),
});
