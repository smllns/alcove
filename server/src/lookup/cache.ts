import { lookupCache } from '../db.js';

const DAY_MS = 24 * 60 * 60 * 1000;

// What's being looked up right now, by key
const underway = new Map<string, Promise<unknown>>();

// Returns the cached value for `key`, or computes, stores and returns it.
// Asked for again while it's being worked out (many readers opening the
// same new book at once), the one answer is waited for, not asked twice.
// A failure isn't kept: the next ask tries again.
export function cached<T>(
  key: string,
  days: number,
  compute: () => Promise<T>,
): Promise<T> {
  return once(key, async () => {
    const hit = await lookupCache().findOne({ _id: key });
    if (hit && hit.expiresAt.getTime() > Date.now()) return hit.value as T;
    return store(key, await compute(), days);
  });
}

// How long an answer kept past its time stays, at most, for the next ask
const STALE_KEPT_DAYS = 60;

// The same for an answer that's slow to get: once it's `days` old, the
// one kept is still given at once, and a fresh one asked for behind it,
// for the next time
export async function cachedStale<T>(
  key: string,
  days: number,
  compute: () => Promise<T>,
): Promise<T> {
  const hit = await lookupCache().findOne({ _id: key });
  const refresh = () =>
    once(key, async () => store(key, await compute(), days, STALE_KEPT_DAYS));
  if (!hit) return refresh();
  if ((hit.freshUntil ?? hit.expiresAt).getTime() <= Date.now())
    void refresh().catch(() => {});
  return hit.value as T;
}

// Asks for `key` behind the scenes, so it's there by the time it's wanted
export const warm = <T>(key: string, days: number, compute: () => Promise<T>) =>
  void cachedStale(key, days, compute).catch(() => {});

// One job per key at a time: asked again while it runs, the same one
function once<T>(key: string, job: () => Promise<T>): Promise<T> {
  const running = underway.get(key);
  if (running) return running as Promise<T>;
  const started = job().finally(() => underway.delete(key));
  underway.set(key, started);
  return started;
}

async function store<T>(key: string, value: T, days: number, keptDays = days) {
  const now = Date.now();
  await lookupCache().updateOne(
    { _id: key },
    {
      $set: {
        value,
        freshUntil: new Date(now + days * DAY_MS),
        expiresAt: new Date(now + keptDays * DAY_MS),
      },
    },
    { upsert: true },
  );
  return value;
}

// What's kept for each of `keys` that's still good, by key, without
// working any of it out
export async function peek<T>(keys: string[]) {
  const hits = await lookupCache()
    .find({ _id: { $in: keys }, expiresAt: { $gt: new Date() } })
    .toArray();
  return new Map(hits.map((hit) => [hit._id, hit.value as T]));
}
