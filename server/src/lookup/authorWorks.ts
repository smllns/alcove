import {
  searchDocs,
  SEARCH_FIELDS,
  toWork,
  type SearchDoc,
  type WorkResult,
} from './openLibrary.js';
import { titleKey } from '../lib/text.js';
import { ownBook } from './similar.js';

// A writer's books, from Open Library, the most read first: their own,
// each once, with the year it first came out, for their page. The
// catalogue keeps a translation as a work of its own now and then, and
// collections and box sets beside the books in them; those are left out.

type Found = SearchDoc & { author_key?: string[] };

// How many of their books are looked through, and how many kept
const LOOKED = 100;
const KEPT = 30;

// Books gathered from others: "Collected Stories", "Novels 1963–1973",
// "The Complete Works", a box set
const GATHERED =
  /\b(collected|complete|selected|omnibus|box(ed)?\s*set|novels|collection|works)\b/i;

export async function authorWorks(author: string): Promise<WorkResult[]> {
  const docs = await searchDocs<Found>({
    author_key: author,
    sort: 'readinglog',
    limit: String(LOOKED),
    fields: `${SEARCH_FIELDS},author_key`,
  });
  const seen = new Set<string>();
  return (
    docs
      // Theirs: they come first among its authors, and alone, unless it's
      // been printed more than once (a translation kept as a work of its
      // own names its translator too)
      .filter(
        (doc) =>
          doc.first_publish_year &&
          doc.author_key?.[0] === author &&
          (doc.author_key.length === 1 || (doc.edition_count ?? 1) > 1) &&
          ownBook(doc) &&
          !GATHERED.test(doc.title),
      )
      .filter(
        (doc) =>
          !seen.has(titleKey(doc.title)) &&
          Boolean(seen.add(titleKey(doc.title))),
      )
      .slice(0, KEPT)
      .map(toWork)
  );
}
