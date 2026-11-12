import { Router, type Request } from 'express';
import { currentUser } from '../auth/middleware.js';
import { ownCopies } from '../books/repository.js';
import { queryText } from '../lib/validation.js';
import { unmarked, writerAbout, workAuthor } from './author.js';
import { authorWorks } from './authorWorks.js';
import { cached } from './cache.js';
import { authorKeyOf, noneIfMissing, workKeyOf } from './params.js';
import { writerQuotes } from './wikiquote.js';
import { workTitles } from './workTitles.js';
import type { Languages } from './wikipedia.js';
import {
  nameNoted,
  noteWriterNames,
  ownAuthors,
  sameWriters,
} from './writerNames.js';
import { itemNames } from './wikidataItem.js';

// Who wrote a book: name, years, picture and a few lines about them, in a
// language the reader reads; and for their page, their books and their
// words. Mounted inside the lookups (routes.ts), behind their limit.
export const authorRouter = Router();

// A language as Wikipedia writes it ("en", "ru"), or none
const language = (req: Request, key: string) => {
  const code = queryText(req, key, 3).toLowerCase();
  return /^[a-z]{2,3}$/.test(code) ? code : undefined;
};

// What the reader's copy says: the languages it was read and written in,
// and its titles in them
function asked(req: Request) {
  const languages: Languages = {
    read: language(req, 'read'),
    original: language(req, 'original'),
  };
  const titles = [
    queryText(req, 'title', 200),
    queryText(req, 'original_title', 200),
  ].filter(Boolean);
  // Answers differ by language, not by title (which only helps find them)
  const key = `${languages.read ?? ''}:${languages.original ?? ''}`;
  return { languages, titles, key };
}

// A writer of a book the catalogue doesn't have, by their name, kept by
// it and the book's first title
const writerNamed = (name: string, req: Request) => {
  const { languages, titles, key } = asked(req);
  if (!titles.length) return Promise.resolve(null);
  return cached(
    `writer7:${name.toLowerCase()}:${titles[0].toLowerCase()}:${key}`,
    30,
    () => writerAbout(name, titles, languages),
  );
};

// A writer found by `name` (the reader's way of writing it) noted as going
// by it, by the name they were found under, and by every name Wikidata
// gives them (in Russian, French, …), where Wikidata knows them; once
// they're known by it, not again. Whether more of their names are known
// now, for the reader to ask again who's one (moreNames).
const knownAs = async (
  author: { item?: string; name?: string } | null | undefined,
  name: string,
) => {
  const item = author?.item;
  if (!item || (await nameNoted(item, name || author.name || ''))) return false;
  const known = await cached(`itemnames1:${item}`, 30, () =>
    itemNames(item),
  ).catch(() => []);
  return noteWriterNames(item, [name, author.name ?? '', ...known]).catch(
    () => false,
  );
};

// A book in the catalogue. One it knows only by a bare name is looked for
// instead by their name as the reader has it, as a book it doesn't have
// would be (writerNamed), so the answer about the book itself is kept for
// every reader however they write the name.
authorRouter.get('/works/:workKey/author', async (req, res) => {
  const workKey = workKeyOf(req);
  const { languages, titles, key } = asked(req);
  const found = await cached(`author11:${workKey}:${key}`, 30, () =>
    workAuthor(workKey, titles, languages).catch(noneIfMissing),
  );
  const named = queryText(req, 'name', 200);
  const byName = found?.bare && named ? await writerNamed(named, req) : null;
  const author = byName
    ? { ...byName, key: byName.key ?? found?.key }
    : found && unmarked(found);
  res.json({ author, moreNames: await knownAs(author, named) });
});

// A book the catalogue doesn't have, by its writer's name
authorRouter.get('/writer', async (req, res) => {
  const name = queryText(req, 'name', 200);
  const author = name ? await writerNamed(name, req) : null;
  res.json({ author, moreNames: await knownAs(author, name) });
});

// For the names given (?names=, one to a line), each writer's other names
// known here, in a group for each
authorRouter.get('/writers/same', async (req, res) => {
  const names = queryText(req, 'names', 20000)
    .split('\n')
    .map((each) => each.trim())
    .filter(Boolean)
    .slice(0, 500);
  res.json({ groups: await sameWriters(names) });
});

// The same for the writers on the reader's own shelves
authorRouter.get('/writers/same/mine', async (req, res) => {
  res.json({
    groups: await sameWriters(await ownAuthors(currentUser(req)._id)),
  });
});

// A writer's books, the most read first. The catalogue's answer is kept
// for all readers; which are on this reader's shelves is looked up afresh,
// with the stars the reader gave them.
authorRouter.get('/authors/:authorKey/works', async (req, res) => {
  const author = authorKeyOf(req);
  const works = await cached(`authorworks6:${author}`, 7, () =>
    authorWorks(author),
  );
  const owned = await ownCopies(
    currentUser(req)._id,
    works.map((work) => work.workKey),
  );
  res.json({
    works: works.map((work) => ({ ...work, ...owned.get(work.workKey) })),
  });
});

// Words of the writer's own, from Wikiquote, by the name the catalogue
// knows them by. Nothing found is an answer too.
authorRouter.get('/writer/quotes', async (req, res) => {
  const name = queryText(req, 'name', 200);
  if (!name) {
    res.json({ quotes: [], source: null });
    return;
  }
  res.json(
    await cached(`writerquotes1:${name.toLowerCase()}`, 30, () =>
      writerQuotes(name),
    ),
  );
});

// A book's titles in every language it's known in (workTitles), by the
// titles the reader has for it, the one it first came out under first. The
// same for every reader, and for long: a book's titles hardly change.
authorRouter.get('/work-titles', async (req, res) => {
  const { languages, titles } = asked(req);
  if (!titles.length) {
    res.json({ titles: [] });
    return;
  }
  const first = [...titles].reverse();
  res.json({
    // Wikidata not answering is no answer (workTitles keeps none)
    titles: await workTitles(first, languages).catch(() => []),
  });
});
