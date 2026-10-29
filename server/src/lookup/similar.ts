import {
  searchDocs,
  SEARCH_FIELDS,
  toWork,
  type SearchDoc,
  type WorkResult,
} from './openLibrary.js';
import { firstAuthor, workDoc } from './workDoc.js';

// Books to read next, from Open Library: other books by the same author,
// and books on the same themes. The catalogue's subjects are tagged by
// anyone, so the themes are picked with care and the books found ranked by
// how many of them they share, then by how much they're read. A failure
// fails it all, rather than leaving half an answer kept for days.

type Found = SearchDoc & {
  author_key?: string[];
  subject?: string[];
  language?: string[];
};

// Subjects that say nothing of what a book is about: the kind of book,
// lists and prizes, made-up places and people, or the catalogue's own
// shelving ("Fiction, science fiction, general")
const SAYS_NOTHING =
  /^(fiction|non-?fiction|novela|novels?|literature|general|large type books|accessible book|protected daisy|in library|open_syllabus_project|history|science|[a-z ]+ literature)$|nyt:|award:|new york times|reviewed|bestseller|\bgeneral\b|fictitious character|imaginary place|^fiction,|, fiction$|\d|-$|\//i;

// How many of a book's themes are compared, how many are searched by, and
// how many books each search brings back to choose from
const THEMES = 12;
const SEARCHED = 2;
const CANDIDATES = 40;
// How many of each to offer
const SHOWN = 6;

const plain = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z ]/g, '')
    .trim();

// Books by more than a few people are anthologies, not the author's own
const ownBook = (doc: SearchDoc) => (doc.author_name?.length ?? 0) <= 3;
// Readable here: with an English edition. A translation the catalogue
// keeps as a work of its own ("Un lloc per a en Mungo") has none.
const inEnglish = (doc: Found) => !doc.language || doc.language.includes('eng');
// What's asked of each book found
const FIELDS = `${SEARCH_FIELDS},author_key,language`;

// The books most read first
const search = (params: Record<string, string>) =>
  searchDocs<Found>({ sort: 'readinglog', ...params });

// The author's books most read, other than this one and its doubles
async function byAuthor(workKey: string, author: string, title: string) {
  const docs = await search({
    author_key: author,
    limit: String(SHOWN * 2),
    fields: FIELDS,
  });
  const seen = new Set([plain(title)]);
  return (
    docs
      // Their own: they come first among its authors (not a box set's
      // last), and alone, unless it's been printed more than once (a
      // translation kept as a work of its own names its translator too)
      .filter(
        (doc) =>
          doc.key !== `/works/${workKey}` &&
          doc.author_key?.[0] === author &&
          (doc.author_key.length === 1 || (doc.edition_count ?? 1) > 1) &&
          ownBook(doc) &&
          inEnglish(doc),
      )
      .filter(
        (doc) => !seen.has(plain(doc.title)) && seen.add(plain(doc.title)),
      )
      .slice(0, SHOWN)
      .map(toWork)
  );
}

// Other authors' books on the same themes: those sharing the most of
// them, the more read the better, one per author
async function alike(workKey: string, author: string, subjects: string[]) {
  const themes = subjects
    .filter((s) => !SAYS_NOTHING.test(s.trim()))
    .slice(0, THEMES);
  if (!themes.length) return [];
  const nonFiction = subjects.some((s) => /non-?fiction/i.test(s));
  const fiction = !nonFiction && subjects.some((s) => /fiction|novel/i.test(s));
  const forChildren = subjects.some((s) => /juvenile|children/i.test(s));
  const ours = new Set(themes.map(plain));

  const found = new Map<string, { doc: Found; shared: number; rank: number }>();
  const searches = themes.slice(0, SEARCHED).map((theme) =>
    search({
      q: [
        `subject:"${theme}"`,
        fiction && 'AND subject:"Fiction"',
        !forChildren &&
          '-subject:"Juvenile fiction" -subject:"Juvenile literature"',
      ]
        .filter(Boolean)
        .join(' '),
      limit: String(CANDIDATES),
      fields: `${FIELDS},subject`,
    }),
  );
  for (const docs of await Promise.all(searches))
    docs.forEach((doc, rank) => {
      if (doc.key === `/works/${workKey}` || !ownBook(doc) || !inEnglish(doc))
        return;
      if (doc.author_key?.includes(author)) return;
      const shared = (doc.subject ?? []).filter((s) =>
        ours.has(plain(s)),
      ).length;
      const before = found.get(doc.key);
      if (!before || rank < before.rank)
        found.set(doc.key, { doc, shared, rank });
    });

  // Sharing one theme is chance; two or more, a likeness
  const score = ({ shared, rank }: { shared: number; rank: number }) =>
    shared + (CANDIDATES - rank) / (CANDIDATES / 2);
  const authors = new Set<string>();
  return [...found.values()]
    .filter((f) => f.shared >= 2)
    .sort((a, b) => score(b) - score(a))
    .filter(({ doc }) => {
      const by = doc.author_key?.[0] ?? doc.key;
      return !authors.has(by) && Boolean(authors.add(by));
    })
    .slice(0, SHOWN)
    .map(({ doc }) => toWork(doc));
}

type SimilarWorks = { alike: WorkResult[]; byAuthor: WorkResult[] };

export async function similarWorks(workKey: string): Promise<SimilarWorks> {
  const work = await workDoc(workKey);
  const author = firstAuthor(work);
  if (!author) return { alike: [], byAuthor: [] };
  const [sameThemes, sameAuthor] = await Promise.all([
    alike(workKey, author, work.subjects ?? []),
    byAuthor(workKey, author, work.title ?? ''),
  ]);
  return { alike: sameThemes, byAuthor: sameAuthor };
}
