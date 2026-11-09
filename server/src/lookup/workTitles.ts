import { titleKey } from '../lib/text.js';
import { cached } from './cache.js';
import { entities, linked, wikidata, type Entity } from './wikidata.js';
import type { Languages } from './wikipedia.js';

// A book's titles in every language it's known in, and who wrote it, from
// its item on Wikidata, where a book is one item however many languages it
// came out in: "День опричника", "Day of the Oprichnik", "Der Tag des
// Opritschniks". For telling a translation from another book, as the book
// catalogue keeps a translation apart, as a book of its own. Found by the
// titles the reader has (the one it first came out under first), in the
// languages it was written and read in: an item called that, with a
// writer, that is; for one of its editions, the book it's an edition of.
// None found, none.

// How many items called that are looked at
const LOOKED = 7;
const PROPS = 'labels|aliases|claims';

// Every title an item has, in every language, aliases too
const titlesOf = ({ labels = {}, aliases = {} }: Entity) =>
  [...Object.values(labels), ...Object.values(aliases)]
    .flat()
    .map((each) => each.value);

async function search(title: string, language: string) {
  const found = await wikidata<{ search?: { id: string }[] }>({
    action: 'wbsearchentities',
    search: title,
    language,
    uselang: language,
    type: 'item',
    limit: String(LOOKED),
  });
  return (found.search ?? []).map((each) => each.id);
}

// The book's item, found by its titles (each once, however many ways the
// reader has it written), each item looked at once however many searches
// bring it up
async function bookItem(titles: string[], languages: Languages) {
  const wanted = new Set(titles.map(titleKey));
  const asked = titles.filter(
    (title, i) =>
      titles.findIndex((other) => titleKey(other) === titleKey(title)) === i,
  );
  const langs = [
    ...new Set(
      [languages.original, languages.read, 'en'].filter(
        (lang): lang is string => Boolean(lang),
      ),
    ),
  ];
  const seen = new Set<string>();
  for (const title of asked)
    for (const lang of langs) {
      const ids = (await search(title, lang)).filter((id) => !seen.has(id));
      if (!ids.length) continue;
      for (const id of ids) seen.add(id);
      const found = await entities(ids, PROPS);
      const book = ids
        .map((id) => found[id])
        .find(
          (entity) =>
            entity &&
            // Written by someone (P50), or an edition of what is (P629)
            (linked(entity, 'P50') || linked(entity, 'P629')) &&
            titlesOf(entity).some((each) => wanted.has(titleKey(each))),
        );
      if (!book) continue;
      const of = !linked(book, 'P50') && linked(book, 'P629');
      return of ? ((await entities([of], PROPS))[of] ?? book) : book;
    }
  return null;
}

// The book's titles and its writer's item, asked once for both and kept
// long: a book's titles hardly change
const theBook = (titles: string[], languages: Languages) =>
  cached(
    `bookitem1:${titles.join('|').toLowerCase()}:${languages.read ?? ''}:${languages.original ?? ''}`,
    60,
    async () => {
      const book = await bookItem(titles, languages);
      return {
        titles: book ? [...new Set(titlesOf(book))] : [],
        writer: book ? linked(book, 'P50') : undefined,
      };
    },
  );

export const workTitles = async (titles: string[], languages: Languages) =>
  (await theBook(titles, languages)).titles;

// Who wrote a book, as Wikidata has it: their item (P50, its writer), by
// the book's titles; for a writer Wikipedia can't be searched for by name
// in the reader's alphabet (Йоав Блум is יואב בלום in his own)
export const writerOfBook = async (titles: string[], languages: Languages) =>
  (await theBook(titles, languages)).writer;
