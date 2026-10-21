import { boldParts, plainText } from './wikitext.js';
import { HEADERS } from './agent.js';
import { throttle } from './throttle.js';

// Wikiquote (en.wikiquote.org): quotations gathered by the Wikimedia
// community, free to reuse with credit (CC BY-SA). A well-known book has a
// page of its own; others are a section on their author's page. No key;
// Wikimedia asks for a User-Agent with a way to get in touch, and turns
// away anyone asking too often.
const API = 'https://en.wikiquote.org/w/api.php';
const nextTurn = throttle(1, 8000);

// As many as are offered for a book
const MAX = 8;
// Long enough to be worth keeping, short enough to read as one quote
const SHORTEST = 25;
const LONGEST = 320;

export type BookQuotes = { quotes: string[]; source: string | null };

async function api<T>(params: Record<string, string>): Promise<T> {
  await nextTurn();
  const query = new URLSearchParams({
    format: 'json',
    formatversion: '2',
    ...params,
  });
  const res = await fetch(`${API}?${query}`, {
    headers: HEADERS,
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`Wikiquote answered ${res.status}`);
  return res.json() as Promise<T>;
}

// Titles and names compared without case, accents or punctuation:
// "J.R.R. Tolkien" is "J. R. R. Tolkien", "Mr Fox" is "Mr. Fox"
const norm = (text: string) =>
  text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');

const searchTitles = async (search: string) =>
  (
    await api<{ query?: { search: { title: string }[] } }>({
      action: 'query',
      list: 'search',
      srsearch: search,
      srlimit: '8',
    })
  ).query?.search.map((r) => r.title) ?? [];

const wikitextOf = async (page: string) =>
  (
    await api<{ parse?: { wikitext: string } }>({
      action: 'parse',
      page,
      prop: 'wikitext',
      redirects: '1',
    })
  ).parse?.wikitext ?? '';

// Sections that aren't the book's own words
const NOT_THE_BOOK =
  /about|review|criticism|external|see also|adaptation|disputed|misattributed|cast|dialogue/i;

const headingLevel = (line: string) => /^(=+)/.exec(line)?.[1].length ?? 0;

// The quoted lines in a stretch of a page: each `* …` line (not the `**`
// that says where it came from), as plain text
function quotedLines(lines: string[]) {
  const found: { text: string; bold: string[] }[] = [];
  let skipping = 0;
  for (const line of lines) {
    const level = headingLevel(line);
    if (level) {
      if (skipping && level <= skipping) skipping = 0;
      if (!skipping && NOT_THE_BOOK.test(line)) skipping = level;
      continue;
    }
    if (skipping || !/^\*\s*[^*:]/.test(line)) continue;
    const raw = line.replace(/^\*\s*/, '');
    found.push({ text: plainText(raw), bold: boldParts(raw) });
  }
  return found;
}

// The best of them: those the page sets in bold first, as they're the ones
// a book is known for, then the rest in order. A long passage with a bold
// line in it gives just that line.
function pick(lines: { text: string; bold: string[] }[]) {
  const shown = lines.map(({ text, bold }) =>
    bold.length && text.length > LONGEST
      ? { text: bold.join(' … '), bold: true }
      : { text, bold: bold.length > 0 },
  );
  const fits = shown.filter(
    ({ text }) => text.length >= SHORTEST && text.length <= LONGEST,
  );
  const ranked = [
    ...fits.filter((q) => q.bold),
    ...fits.filter((q) => !q.bold),
  ];
  return [...new Set(ranked.map((q) => q.text))].slice(0, MAX);
}

// The stretch of an author's page under the heading naming the book
function sectionAbout(wikitext: string, title: string) {
  const lines = wikitext.split('\n');
  const start = lines.findIndex(
    (line) =>
      headingLevel(line) && norm(plainText(line)).startsWith(norm(title)),
  );
  if (start < 0) return [];
  const level = headingLevel(lines[start]);
  const end = lines.findIndex(
    (line, i) => i > start && headingLevel(line) && headingLevel(line) <= level,
  );
  return lines.slice(start + 1, end < 0 ? undefined : end);
}

const pageUrl = (page: string) =>
  `https://en.wikiquote.org/wiki/${encodeURIComponent(page.replace(/ /g, '_'))}`;

// Quotes from the book: its own page if it has one (and it's by this
// author), else its section on the author's page
export async function bookQuotes(
  title: string,
  author: string,
): Promise<BookQuotes> {
  const none = { quotes: [], source: null };
  const results = await searchTitles(`${title} ${author}`);
  const surname = norm(author.split(/\s+/).at(-1) ?? '');

  const own = results.find((page) =>
    [norm(title), `${norm(title)}novel`, `${norm(title)}book`].includes(
      norm(page),
    ),
  );
  if (own) {
    const text = await wikitextOf(own);
    if (!surname || norm(text).includes(surname)) {
      const quotes = pick(quotedLines(text.split('\n')));
      if (quotes.length) return { quotes, source: pageUrl(own) };
    }
  }

  const authorPage = results.find((page) => norm(page) === norm(author));
  if (!authorPage) return none;
  const quotes = pick(
    quotedLines(sectionAbout(await wikitextOf(authorPage), title)),
  );
  return quotes.length ? { quotes, source: pageUrl(authorPage) } : none;
}
