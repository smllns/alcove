import { Router, type Request } from 'express';
import { queryText } from '../lib/validation.js';
import { writerAbout, workAuthor } from './author.js';
import { cached } from './cache.js';
import { noneIfMissing, workKeyOf } from './params.js';
import type { Languages } from './wikipedia.js';

// Who wrote a book: name, years, picture and a few lines about them, in a
// language the reader reads. Mounted inside the lookups (routes.ts),
// behind their limit.
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

// A book in the catalogue
authorRouter.get('/works/:workKey/author', async (req, res) => {
  const workKey = workKeyOf(req);
  const { languages, titles, key } = asked(req);
  const author = await cached(`author4:${workKey}:${key}`, 30, () =>
    workAuthor(workKey, titles, languages).catch(noneIfMissing),
  );
  res.json({ author });
});

// A book the catalogue doesn't have, by its writer's name
authorRouter.get('/writer', async (req, res) => {
  const name = queryText(req, 'name', 200);
  const { languages, titles, key } = asked(req);
  if (!name || !titles.length) {
    res.json({ author: null });
    return;
  }
  const author = await cached(
    `writer1:${name.toLowerCase()}:${titles[0].toLowerCase()}:${key}`,
    30,
    () => writerAbout(name, titles, languages),
  );
  res.json({ author });
});
