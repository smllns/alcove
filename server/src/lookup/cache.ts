import { lookupCache } from '../db.js';

const DAY_MS = 24 * 60 * 60 * 1000;

// Returns the cached value for `key`, or computes, stores and returns it
export async function cached<T>(
  key: string,
  days: number,
  compute: () => Promise<T>,
) {
  const hit = await lookupCache().findOne({ _id: key });
  if (hit && hit.expiresAt.getTime() > Date.now()) return hit.value as T;

  const value = await compute();
  await lookupCache().updateOne(
    { _id: key },
    { $set: { value, expiresAt: new Date(Date.now() + days * DAY_MS) } },
    { upsert: true },
  );
  return value;
}
