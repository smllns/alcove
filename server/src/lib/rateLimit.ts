import { rateLimit } from 'express-rate-limit';
import { HttpError } from './errors.js';

// Slows down password guessing: 20 attempts per 15 minutes per IP, for any
// route that checks a password
export const passwordAttempts = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
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
