import { unaccented } from '../lib/text.js';
import { fromWikimedia } from './wikimedia.js';

// Wikipedia, for a few lines about a book's author when the catalogue has
// none, in a language the reader reads: the English article, or else the
// one in the language they read the book in. Looked for in that language
// first, then in the one the book was written in, then in English (or
// Russian, for a name written in Cyrillic); an article found in a language
// they mightn't read is followed to its version in English or in theirs.
// What it says is shared under CC BY-SA, so it comes with the article's
// address, to credit.

const wikipedia = (lang: string) => `https://${lang}.wikipedia.org`;

// Asking the Wikipedia in `lang` (its query API)
const query = <T>(lang: string, params: Record<string, string>) =>
  fromWikimedia<{ query?: T }>(
    `${wikipedia(lang)}/w/api.php?${new URLSearchParams({
      ...params,
      action: 'query',
      format: 'json',
      formatversion: '2',
    })}`,
  );

// The languages to look in: the one the book was read in, the one it was
// written in (Wikipedia's codes: "en", "ru", "de")
export type Languages = { read?: string; original?: string };

type Article = {
  extract: string;
  url?: string;
  photo?: string;
  // The language it's written in
  language: string;
};

type Summary = {
  type?: string;
  extract?: string;
  thumbnail?: { source?: string };
  content_urls?: { desktop?: { page?: string } };
};

// An article's opening, address and picture; none for a page that only
// lists those of the same name, or one with nothing to say
async function article(title: string, lang: string): Promise<Article | null> {
  const page = await fromWikimedia<Summary>(
    `${wikipedia(lang)}/api/rest_v1/page/summary/${encodeURIComponent(title.replace(/ /g, '_'))}`,
  );
  if (page.type !== 'standard' || !page.extract) return null;
  return {
    // Without the stress marks the Russian one puts on names ("Мари́я")
    extract: page.extract.replace(/́/g, ''),
    url: page.content_urls?.desktop?.page,
    photo: page.thumbnail?.source,
    language: lang,
  };
}

// The Wikipedia a writer's name is likeliest found in, as it's written
const scriptOf = (name: string) =>
  /\p{Script=Cyrillic}/u.test(name) ? 'ru' : 'en';

// The languages the reader reads, the one they'd rather first: English,
// and the one they read the book in (or, not knowing that, the one the
// writer's name is written in, as they have it)
const readable = ({ read }: Languages, name: string) => [
  ...new Set(['en', read ?? scriptOf(name)]),
];

// The article Wikidata links an item to, in a language the reader reads
export async function articleOnItem(
  item: string,
  name: string,
  languages: Languages,
) {
  const wanted = readable(languages, name);
  const entity = await fromWikimedia<{
    entities?: Record<
      string,
      { sitelinks?: Record<string, { title: string } | undefined> }
    >;
  }>(
    `https://www.wikidata.org/w/api.php?${new URLSearchParams({
      action: 'wbgetentities',
      ids: item,
      props: 'sitelinks',
      sitefilter: wanted.map((lang) => `${lang}wiki`).join('|'),
      format: 'json',
    })}`,
  );
  const links = entity.entities?.[item]?.sitelinks ?? {};
  for (const lang of wanted) {
    const title = links[`${lang}wiki`]?.title;
    if (title) return article(title, lang);
  }
  return null;
}

// The words of a name, without case, accents or punctuation ("Алёхина,
// Мария Владимировна": алехина, мария, владимировна)
const words = (text: string) =>
  unaccented(text)
    .split(/[^\p{L}]+/u)
    .filter(Boolean);

// How many of a writer's books are looked for along with their name
const BOOKS = 6;

type Found = { title: string; english?: string };

// The article on a writer in the Wikipedia in `lang`, with its English
// version's title if there is one, found by their name along with any of
// their books, so it's them and not someone else of the same name (two
// Eliza Clarks write; the British one wrote "Boy Parts"). Only an article
// named for them, whatever the order of their names, perhaps with one name
// more or told apart in brackets ("Eliza Clark (British author)",
// "Алёхина, Мария Владимировна"), not one on a book or anything else
// mentioning both ("Argall: The True Story of Pocahontas and Captain John
// Smith").
async function writerIn(
  lang: string,
  name: string,
  titles: string[],
): Promise<Found | null> {
  const found = await query<{
    pages?: {
      title: string;
      index?: number;
      langlinks?: { title: string }[];
    }[];
  }>(lang, {
    generator: 'search',
    gsrsearch: `"${name}" (${titles.join(' OR ')})`,
    gsrlimit: '6',
    prop: 'langlinks',
    lllang: 'en',
  });
  const them = words(name);
  const page = (found.query?.pages ?? [])
    .sort((a, b) => (a.index ?? 0) - (b.index ?? 0))
    .find((page) => {
      const said = words(page.title.replace(/\(.*\)/, ''));
      return (
        said.length <= them.length + 1 && them.every((w) => said.includes(w))
      );
    });
  if (!page) return null;
  return { title: page.title, english: page.langlinks?.[0]?.title };
}

// The title of an article's version in another language, if it has one
async function versionIn(lang: string, title: string, from: string) {
  const found = await query<{
    pages?: { langlinks?: { title: string }[] }[];
  }>(from, { titles: title, prop: 'langlinks', lllang: lang });
  return found.query?.pages?.[0]?.langlinks?.[0]?.title;
}

// The article on a writer, by their name and books, in a language the
// reader reads (see the top)
export async function articleOnWriter(
  name: string,
  books: string[],
  languages: Languages,
) {
  const titles = [...new Set(books.filter(Boolean))]
    .slice(0, BOOKS)
    .map((book) => `"${book.replace(/"/g, '')}"`);
  if (!titles.length) return null;
  const theirs = readable(languages, name);
  const places = new Set(
    [languages.read, languages.original, scriptOf(name), 'en'].filter(
      (lang): lang is string => Boolean(lang),
    ),
  );
  for (const lang of places) {
    // A Wikipedia that isn't there, or doesn't answer, is passed over
    const found = await writerIn(lang, name, titles).catch(() => null);
    if (!found) continue;
    if (found.english) return article(found.english, 'en');
    if (theirs.includes(lang)) return article(found.title, lang);
    // Found only in a language the reader mightn't read: its version in
    // the one they read the book in
    const read = languages.read;
    const version = read && (await versionIn(read, found.title, lang));
    if (version) return article(version, read);
  }
  return null;
}
