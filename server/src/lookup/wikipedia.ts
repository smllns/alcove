import { unaccented } from '../lib/text.js';
import { fromWikimedia } from './wikimedia.js';

// Wikipedia, for a few lines about a book's author when the catalogue has
// none: the English one, or the Russian for a name written in Cyrillic.
// What it says is shared under CC BY-SA, so it comes with the article's
// address, to credit.

const wikipedia = (lang: string) => `https://${lang}.wikipedia.org`;

type Article = { extract: string; url?: string; photo?: string };

type Summary = {
  type?: string;
  extract?: string;
  thumbnail?: { source?: string };
  content_urls?: { desktop?: { page?: string } };
};

// An article's opening, address and picture; none for a page that only
// lists those of the same name, or one with nothing to say
async function article(title: string, lang = 'en'): Promise<Article | null> {
  const page = await fromWikimedia<Summary>(
    `${wikipedia(lang)}/api/rest_v1/page/summary/${encodeURIComponent(title.replace(/ /g, '_'))}`,
  );
  if (page.type !== 'standard' || !page.extract) return null;
  return {
    // Without the stress marks the Russian one puts on names ("Мари́я")
    extract: page.extract.replace(/\u0301/g, ''),
    url: page.content_urls?.desktop?.page,
    photo: page.thumbnail?.source,
  };
}

// The article Wikidata links an item to, if any
export async function articleOnItem(item: string) {
  const entity = await fromWikimedia<{
    entities?: Record<string, { sitelinks?: { enwiki?: { title: string } } }>;
  }>(
    `https://www.wikidata.org/w/api.php?${new URLSearchParams({
      action: 'wbgetentities',
      ids: item,
      props: 'sitelinks',
      sitefilter: 'enwiki',
      format: 'json',
    })}`,
  );
  const title = entity.entities?.[item]?.sitelinks?.enwiki?.title;
  return title ? article(title) : null;
}

// The words of a name, without case, accents or punctuation ("Алёхина,
// Мария Владимировна": алехина, мария, владимировна)
const words = (text: string) =>
  unaccented(text)
    .split(/[^\p{L}]+/u)
    .filter(Boolean);

// How many of a writer's books are looked for along with their name
const BOOKS = 6;

// The article on a writer, found by their name along with any of their
// books, so it's them and not someone else of the same name (two Eliza
// Clarks write; the British one wrote "Boy Parts"). Only an article named
// for them, whatever the order of their names, perhaps with one name more
// or told apart in brackets ("Eliza Clark (British author)", "Алёхина,
// Мария Владимировна"), not one on a book or anything else mentioning
// both ("Argall: The True Story of Pocahontas and Captain John Smith").
export async function articleOnWriter(name: string, books: string[]) {
  const lang = /\p{Script=Cyrillic}/u.test(name) ? 'ru' : 'en';
  const titles = books
    .slice(0, BOOKS)
    .map((book) => `"${book.replace(/"/g, '')}"`);
  if (!titles.length) return null;
  const found = await fromWikimedia<{
    query?: { search?: { title: string }[] };
  }>(
    `${wikipedia(lang)}/w/api.php?${new URLSearchParams({
      action: 'query',
      list: 'search',
      srsearch: `"${name}" (${titles.join(' OR ')})`,
      srlimit: '6',
      format: 'json',
    })}`,
  );
  const them = words(name);
  const named = (found.query?.search ?? [])
    .map((result) => result.title)
    .filter((title) => {
      const said = words(title.replace(/\(.*\)/, ''));
      return (
        said.length <= them.length + 1 && them.every((w) => said.includes(w))
      );
    });
  for (const title of named) {
    const page = await article(title, lang);
    if (page) return page;
  }
  return null;
}
