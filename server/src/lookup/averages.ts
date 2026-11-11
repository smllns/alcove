import { keepAll, peek } from './cache.js';
import { WORK_KEY } from './openLibrary.js';
import { worksByKeys } from './worksByKeys.js';

// How the catalogue's readers rate each of many books, out of five (null
// for one none have rated, or the catalogue doesn't know), for ordering a
// list by it: each kept a week, those not kept found by the catalogue's
// search a few dozen at a time (worksByKeys)

const KEPT_DAYS = 7;
// Most asked for at once
export const MOST_AVERAGES = 200;

const keyOf = (workKey: string) => `average1:${workKey}`;

export async function averageRatings(workKeys: string[]) {
  const keys = [...new Set(workKeys)].filter((key) => WORK_KEY.test(key));
  const kept = await peek<number | null>(keys.map(keyOf));
  const missing = keys.filter((key) => !kept.has(keyOf(key)));
  if (missing.length) {
    const found = new Map(
      (await worksByKeys(missing)).map((work) => [work.workKey, work]),
    );
    const fresh = new Map(
      missing.map((key) => [keyOf(key), found.get(key)?.averageRating ?? null]),
    );
    await keepAll(fresh, KEPT_DAYS);
    for (const [key, average] of fresh) kept.set(key, average);
  }
  return Object.fromEntries(
    keys.map((key) => [key, kept.get(keyOf(key)) ?? null]),
  );
}
