import { cached } from './cache.js';
import { cleanDescription } from './description.js';
import {
  firstAuthor,
  fromOpenLibrary,
  workDoc,
  yearOf,
} from './openLibrary.js';
import { articleOnItem, articleOnWriter } from './wikipedia.js';

// Who wrote a book, from Open Library: their name, years, picture and a
// few lines about them. Where Open Library has nothing to say about them,
// or no picture, the opening of their Wikipedia article: the one Open
// Library links them to, or else the one found by their name and the book
// (shared under CC BY-SA, so it comes with its address, to credit).

type AuthorAbout = {
  key: string;
  name: string;
  born?: number;
  died?: number;
  bio?: string;
  photoUrl?: string;
  // The Wikipedia article the lines about them are from, if they are
  wikipedia?: string;
};

type AuthorDoc = {
  name?: string;
  birth_date?: string;
  death_date?: string;
  bio?: string | { value?: string };
  photos?: number[];
  remote_ids?: { wikidata?: string };
};

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

// The book's first author; none when the catalogue doesn't name one
export async function workAuthor(workKey: string): Promise<AuthorAbout | null> {
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
    bio: cleanDescription(
      typeof doc.bio === 'string' ? doc.bio : doc.bio?.value,
    ),
    photoUrl: photo
      ? `https://covers.openlibrary.org/a/id/${photo}-M.jpg`
      : undefined,
  };
  if (about.bio && about.photoUrl) return about;
  const item = doc.remote_ids?.wikidata;
  const linked = item ? await articleOnItem(item).catch(() => null) : null;
  const wiki =
    linked ??
    (about.name
      ? await articleOnWriter(
          about.name,
          await booksBy(key, work.title).catch(() => [work.title ?? '']),
        ).catch(() => null)
      : null);
  if (!wiki) return about;
  return {
    ...about,
    photoUrl: about.photoUrl ?? wiki.photo,
    ...(!about.bio && { bio: wiki.extract, wikipedia: wiki.url }),
  };
}
