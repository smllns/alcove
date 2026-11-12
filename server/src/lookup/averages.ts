import { alcoveStars, blended } from './alcoveRatings.js';
import { keepAll, peek } from './cache.js';
import { WORK_KEY } from './openLibrary.js';
import { worksByKeys } from './worksByKeys.js';

// How readers rate each of many books, out of five (null for one none have
// rated), for ordering a list by it: the catalogue's readers' (each kept a
// week, those not kept found by the catalogue's search a few dozen at a
// time: worksByKeys) and alcove's, together (blended)

const KEPT_DAYS = 7;
// Most asked for at once
export const MOST_AVERAGES = 200;

const keyOf = (workKey: string) => `average2:${workKey}`;
type Rated = { average: number; count: number } | null;

export async function averageRatings(workKeys: string[]) {
  const keys = [...new Set(workKeys)].filter((key) => WORK_KEY.test(key));
  const [kept, ours] = await Promise.all([
    peek<Rated>(keys.map(keyOf)),
    alcoveStars(keys),
  ]);
  const missing = keys.filter((key) => !kept.has(keyOf(key)));
  if (missing.length) {
    const found = new Map(
      (await worksByKeys(missing)).map((work) => [work.workKey, work]),
    );
    const fresh = new Map(
      missing.map((key): [string, Rated] => {
        const work = found.get(key);
        return [
          keyOf(key),
          work?.averageRating
            ? { average: work.averageRating, count: work.ratingsCount ?? 1 }
            : null,
        ];
      }),
    );
    await keepAll(fresh, KEPT_DAYS);
    for (const [key, average] of fresh) kept.set(key, average);
  }
  return Object.fromEntries(
    keys.map((key) => [
      key,
      blended(kept.get(keyOf(key)), ours.get(key))?.average ?? null,
    ]),
  );
}
