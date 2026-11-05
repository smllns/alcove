import type { Request } from 'express';
import { HttpError } from '../lib/errors.js';
import { WORK_KEY } from './openLibrary.js';

// The work a lookup is about, from its address
export const workKeyOf = (req: Request) => {
  const { workKey } = req.params;
  if (typeof workKey !== 'string' || !WORK_KEY.test(workKey))
    throw new HttpError(400, 'bad_work', 'That isn’t a book we know.');
  return workKey;
};

// A book the catalogue doesn't have says nothing, rather than failing
export const noneIfMissing = (err: unknown) => {
  if (err instanceof HttpError && err.status === 404) return null;
  throw err;
};
