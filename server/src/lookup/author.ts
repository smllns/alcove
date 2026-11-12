import { cached } from './cache.js';
import { cleanDescription } from './description.js';
import { fromOpenLibrary, yearOf } from './openLibrary.js';
import { firstAuthor, workDoc } from './workDoc.js';
import { articleOnItem, articleOnWriter, type Languages } from './wikipedia.js';
import { catalogueKey, soundAlike } from './catalogueWriter.js';
import { itemFacts } from './wikidataItem.js';
import { writerOfBook } from './workTitles.js';

// Who wrote a book, from Open Library: their name, years, picture and a
// few lines about them. Where Open Library has nothing to say about them,
// or no picture, the opening of their Wikipedia article, in a language the
// reader reads (wikipedia.ts): the one Open Library links them to, or else
// the one found by their name and the book (shared under CC BY-SA, so it
// comes with its address, to credit). Their years, where Open Library
// hasn't them, from Wikidata. A book the catalogue doesn't have
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
  // Their item on Wikidata, by which however their name is written they're
  // one writer (writerNames)
  item?: string;
};

// What's said of a writer, without the word that they're bare
export const unmarked = <T extends { bare?: boolean }>({
  bare: _bare,
  ...about
}: T) => about;

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

// What Wikidata adds (`item`, theirs there): their years, where they're
// not known already; and for one known by no key, or only by a name in
// Cyrillic (a record the catalogue made from a Russian edition, with a
// book or two), the catalogue's key for them under their name in English,
// where the rest of their books are
async function withItem(found: AuthorAbout, item: string | undefined) {
  const about = item ? { ...found, item } : found;
  const cyrillic = /\p{Script=Cyrillic}/u.test(about.name);
  const keyless = !about.key || cyrillic;
  if (!item || (about.born && !keyless)) return about;
  const facts = await itemFacts(item).catch(() => null);
  if (!facts) return about;
  const key =
    keyless && facts.english
      ? await catalogueKey(facts.english).catch(() => undefined)
      : undefined;
  return {
    ...about,
    ...(key && { key, name: facts.english }),
    ...(!about.born && {
      born: facts.born,
      died: about.died ?? facts.died,
    }),
  };
}

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
// One the catalogue keeps only as a bare record, nothing about them but a
// name (made from one edition, "nil gejman" for a Russian Coraline), is
// said to be `bare`, to be looked for by the name the reader has for them
// (writerAbout), where the rest of their books are.
export async function workAuthor(
  workKey: string,
  titles: string[],
  languages: Languages,
): Promise<(AuthorAbout & { bare?: boolean }) | null> {
  const work = await workDoc(workKey);
  const key = firstAuthor(work);
  return key ? keyedAuthor(key, work.title, titles, languages) : null;
}

// A writer by their key in the catalogue, as workAuthor tells them; `first`:
// the title of the book they're asked about by, if any
async function keyedAuthor(
  key: string,
  first: string | undefined,
  titles: string[],
  languages: Languages,
): Promise<AuthorAbout & { bare?: boolean }> {
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
  const item = doc.remote_ids?.wikidata;
  if (about.bio && about.photoUrl) return withItem(about, item);
  const bare = !about.bio && !about.photoUrl && !item;
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
            ...(await booksBy(key, first).catch(() => [first ?? ''])),
          ],
          languages,
        ).catch(() => null)
      : null);
  const told = await withItem(withArticle(about, wiki), item ?? wiki?.item);
  return bare ? { ...told, bare } : told;
}

// A writer of a book the catalogue doesn't have, by their name and the
// book's titles, from Wikipedia, or, not found there by name, by the book
// on Wikidata, which says who wrote it, or, a name in Cyrillic, by how it
// sounds among the catalogue's writers (soundAlike); none when nothing
// knows them. Their
// years and their name in English from Wikidata, and by that name, their
// key in the catalogue, if it has them, for their books there.
export async function writerAbout(
  name: string,
  titles: string[],
  languages: Languages,
): Promise<AuthorAbout | null> {
  const wiki = await articleOnWriter(name, titles, languages).catch(() => null);
  if (wiki) return withItem(withArticle({ name }, wiki), wiki.item);
  // Not found by name: by their book, whose item on Wikidata says who
  // wrote it, and theirs links their article
  const item = await writerOfBook(titles, languages).catch(() => undefined);
  if (!item) {
    // Nor that: one the catalogue has under their name in Latin letters
    const alike = await soundAlike(name).catch(() => undefined);
    if (!alike) return null;
    return unmarked(await keyedAuthor(alike.key, undefined, titles, languages));
  }
  const linked = await articleOnItem(item, name, languages).catch(() => null);
  return withItem(withArticle({ name }, linked), item);
}
