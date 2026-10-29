import {
  EDITION_KEY,
  SEARCH_FIELDS,
  searchDocs,
  toWork,
  WORK_KEY,
  type SearchDoc,
  type WorkResult,
} from './openLibrary.js';

// How many keys are asked for in one search
const BATCH = 50;

type Doc = SearchDoc & { edition_key?: string[] };

// The works `keys` are (works, OL…W, and editions, OL…M, as the works
// they're of), in the order given, each once; any the catalogue can't find
// left out. Found by the catalogue's search, a few dozen at a time.
export async function worksByKeys(keys: string[]) {
  const found = new Map<string, WorkResult>();
  for (let i = 0; i < keys.length; i += BATCH) {
    const batch = keys.slice(i, i + BATCH);
    const works = batch.filter((key) => WORK_KEY.test(key));
    const editions = batch.filter((key) => EDITION_KEY.test(key));
    const asked = [
      works.length &&
        `key:(${works.map((key) => `/works/${key}`).join(' OR ')})`,
      editions.length && `edition_key:(${editions.join(' OR ')})`,
    ].filter(Boolean);
    if (!asked.length) continue;
    const docs = await searchDocs<Doc>({
      q: asked.join(' OR '),
      fields: editions.length ? `${SEARCH_FIELDS},edition_key` : SEARCH_FIELDS,
      limit: String(BATCH * 2),
    });
    for (const doc of docs) {
      const work = toWork(doc);
      found.set(work.workKey, work);
      for (const edition of doc.edition_key ?? [])
        if (editions.includes(edition)) found.set(edition, work);
    }
  }
  const seen = new Set<string>();
  return keys.flatMap((key) => {
    const work = found.get(key);
    if (!work || seen.has(work.workKey)) return [];
    seen.add(work.workKey);
    return [work];
  });
}
