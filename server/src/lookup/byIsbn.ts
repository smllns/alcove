import { HttpError } from '../lib/errors.js';
import { detailsOfWork, rememberFound } from '../catalogue/repository.js';
import { keepAll, peek } from './cache.js';
import {
  cleanIsbn,
  fromOpenLibrary,
  isWork,
  looksLikeIsbn,
  WORK_KEY,
  SEARCH_FIELDS,
  toWork,
  type SearchDoc,
  type WorkResult,
} from './openLibrary.js';

// Books found by their ISBNs, many in one question to the catalogue (its
// search takes "isbn:(… OR …)"), for books brought over from another site

// How many ISBNs are asked at once, and how long the answer's waited for
export const ISBNS_AT_ONCE = 40;
const WAIT_MS = 20_000;
// How long a book found (or not found) is kept, so bringing the same file
// over again asks the catalogue nothing
const KEPT_DAYS = 30;
// The pause before asking once more, the catalogue busy or not answering
const PAUSE_MS = 5000;

const keyOf = (isbn: string) => `byisbn:${isbn}`;

// Asked again once, after a pause, if the catalogue was busy or didn't
// answer; given up on after that
async function patiently<T>(ask: () => Promise<T>) {
  try {
    return await ask();
  } catch (error) {
    const status = error instanceof HttpError ? error.status : 0;
    if (status !== 429 && status !== 502) throw error;
    await new Promise((resolve) => setTimeout(resolve, PAUSE_MS));
    return ask();
  }
}

// One question for up to ISBNS_AT_ONCE of them: each found, by its ISBN,
// the rest known not to be there
async function ask(isbns: string[]) {
  const query = new URLSearchParams({
    q: `isbn:(${isbns.join(' OR ')})`,
    fields: `${SEARCH_FIELDS},isbn`,
    limit: String(isbns.length * 2),
  });
  const { docs } = await patiently(() =>
    fromOpenLibrary<{ docs: (SearchDoc & { isbn?: string[] })[] }>(
      `/search.json?${query}`,
      WAIT_MS,
    ),
  );
  const found = new Map<string, WorkResult | null>(
    isbns.map((isbn) => [isbn, null]),
  );
  for (const doc of docs.filter(isWork))
    for (const isbn of doc.isbn ?? [])
      if (found.get(isbn) === null) found.set(isbn, toWork(doc));
  return found;
}

// The books `isbns` are of, as the catalogue knows them (work, title,
// writers, cover), by ISBN: those kept from before at once, the rest asked
// for a few dozen at a time, and kept. One the catalogue doesn't know is
// null; one it couldn't be asked about (not answering, even the second
// time) isn't there at all, and isn't kept, to be asked about next time.
export async function worksByIsbns(isbns: (string | undefined)[]) {
  const wanted = [
    ...new Set(
      isbns.filter((isbn): isbn is string => !!isbn && looksLikeIsbn(isbn)),
    ),
  ].map(cleanIsbn);
  const kept = await peek<WorkResult | null>(wanted.map(keyOf));
  const found = new Map<string, WorkResult | null>();
  const missing: string[] = [];
  for (const isbn of wanted)
    if (kept.has(keyOf(isbn))) found.set(isbn, kept.get(keyOf(isbn))!);
    else missing.push(isbn);
  for (let from = 0; from < missing.length; from += ISBNS_AT_ONCE) {
    const answer = await ask(missing.slice(from, from + ISBNS_AT_ONCE)).catch(
      () => new Map<string, WorkResult | null>(),
    );
    for (const [isbn, work] of answer) found.set(isbn, work);
    // What Open Library knows, kept in alcove's own catalogue too
    await rememberFound(
      [...answer].flatMap(([isbn, work]) =>
        work ? [detailsOfWork(isbn, work)] : [],
      ),
    );
    await keepAll(
      new Map([...answer].map(([isbn, work]) => [keyOf(isbn), work])),
      KEPT_DAYS,
    );
  }
  return found;
}

// The book one ISBN is of, from what worksByIsbns found (not a printing
// under no work, kept from before they were left out)
export function workOf(
  found: Map<string, WorkResult | null>,
  isbn: string | undefined,
) {
  const work = isbn && looksLikeIsbn(isbn) ? found.get(cleanIsbn(isbn)) : null;
  return work && WORK_KEY.test(work.workKey) ? work : null;
}
