import { cached } from './cache.js';
import { cleanDescription } from './description.js';
import { fromOpenLibrary, yearOf } from './openLibrary.js';
import { firstAuthor, workDoc } from './workDoc.js';
import { articleOnItem, articleOnWriter, type Languages } from './wikipedia.js';

// Who wrote a book, from Open Library: their name, years, picture and a
// few lines about them. Where Open Library has nothing to say about them,
// or no picture, the opening of their Wikipedia article, in a language the
// reader reads (wikipedia.ts): the one Open Library links them to, or else
// the one found by their name and the book (shared under CC BY-SA, so it
// comes with its address, to credit). A book the catalogue doesn't have
// has its writer found on Wikipedia alone, by their name and its titles.

type AuthorAbout = {
  key?: string;
  name: string;
  born?: number;
  died?: number;
  bio?: string;
  photoUrl?: string;
  // The Wikipedia article the lines about them are from, if they are, and
  // the language it's written in
  wikipedia?: string;
  bioLanguage?: string;
};

type AuthorDoc = {
  name?: string;
  birth_date?: string;
  death_date?: string;
  bio?: string | { value?: string };
  photos?: number[];
  remote_ids?: { wikidata?: string };
};

type Article = Awaited<ReturnType<typeof articleOnWriter>>;

// What Open Library knows of a writer, filled in from their article
const withArticle = (about: AuthorAbout, wiki: Article): AuthorAbout =>
  wiki
    ? {
        ...about,
        photoUrl: about.photoUrl ?? wiki.photo,
        ...(!about.bio && {
          bio: wiki.extract,
          wikipedia: wiki.url,
          bioLanguage: wiki.language,
        }),
      }
    : about;

// The titles of an author's books, this one first: for telling them apart
// from others of the same name
async function booksBy(author: string, first: string | undefined) {
  const { entries } = await cached(`authorworks1:${author}`, 30, () =>
    fromOpenLibrary<{ entries?: { title?: string }[] }>(
      `/authors/${author}/works.json?limit=20`,
    ),
  );
  const titles = [first, ...(entries ?? []).map((e) => e.title)];
  return [...new Set(titles.filter((t): t is string => Boolean(t)))];
}

// The book's first author; none when the catalogue doesn't name one.
// `titles`: the book's own, as the reader has it, to find them by too.
export async function workAuthor(
  workKey: string,
  titles: string[],
  languages: Languages,
): Promise<AuthorAbout | null> {
  const work = await workDoc(workKey);
  const key = firstAuthor(work);
  if (!key) return null;
  // Theirs for every book of theirs on anyone's shelves: asked once
  const doc = await cached(`olauthor1:${key}`, 30, () =>
    fromOpenLibrary<AuthorDoc>(`/authors/${key}.json`),
  );
  const photo = doc.photos?.find((id) => id > 0);
  const about: AuthorAbout = {
    key,
    name: doc.name ?? '',
    born: yearOf(doc.birth_date),
    died: yearOf(doc.death_date),
    bio: cleanDescription(doc.bio),
    photoUrl: photo
      ? `https://covers.openlibrary.org/a/id/${photo}-M.jpg`
      : undefined,
  };
  if (about.bio && about.photoUrl) return about;
  const item = doc.remote_ids?.wikidata;
  const linked = item
    ? await articleOnItem(item, about.name, languages).catch(() => null)
    : null;
  const wiki =
    linked ??
    (about.name
      ? await articleOnWriter(
          about.name,
          [
            ...titles,
            ...(await booksBy(key, work.title).catch(() => [work.title ?? ''])),
          ],
          languages,
        ).catch(() => null)
      : null);
  return withArticle(about, wiki);
}

// A writer of a book the catalogue doesn't have, by their name and the
// book's titles; none when Wikipedia hasn't them either
export async function writerAbout(
  name: string,
  titles: string[],
  languages: Languages,
): Promise<AuthorAbout | null> {
  const wiki = await articleOnWriter(name, titles, languages).catch(() => null);
  return wiki ? withArticle({ name }, wiki) : null;
}
