import { HEADERS } from './agent.js';
import { throttle } from './throttle.js';

// Asking Wikimedia's sites (Wikipedia, Wikiquote, Wikidata). No key
// needed, only a User-Agent saying who's asking; one queue for them all,
// since it's the one Wikimedia that turns away anyone asking too often.
const nextTurn = throttle(2, 8000);

export async function fromWikimedia<T>(url: string): Promise<T> {
  await nextTurn();
  const res = await fetch(url, {
    headers: HEADERS,
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`Wikimedia answered ${res.status}`);
  return res.json() as Promise<T>;
}
