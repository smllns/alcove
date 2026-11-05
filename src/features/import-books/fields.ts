import type { BookFormat, NonPhysicalWay } from '@/entities/book/types';

// Reading the cells of another site's export into the shapes alcove keeps

// A cell's text, or undefined for an empty one
export const text = (value: string | undefined) => value?.trim() || undefined;

// A whole number in a cell, if one's there and it's above nought
export function wholeOf(value: string | undefined) {
  const n = Number(value?.trim());
  return Number.isInteger(n) && n > 0 ? n : undefined;
}

// An ISBN, out of the ="978…" a spreadsheet-proof export wraps it in;
// only one with the 10 or 13 figures an ISBN has
export function isbnOf(value: string | undefined) {
  const figures = value?.replace(/[^\dXx]/g, '').toUpperCase();
  return figures && /^(\d{9}[\dX]|\d{13})$/.test(figures) ? figures : undefined;
}

// A day as the exports write it, 2023/01/05 (or with dashes), as alcove
// keeps one, 2023-01-05
export function dayOf(value: string | undefined) {
  const match = value?.trim().match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})/);
  if (!match) return undefined;
  const [, year, month, day] = match;
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

// Stars as alcove gives them, in halves: a quarter star rounded to the
// nearest half; none for nought
export function starsOf(value: string | undefined) {
  const stars = Math.round(Number(value) * 2) / 2;
  return stars >= 0.5 && stars <= 5 ? stars : undefined;
}

// Names written one after another with commas, each tidied
export const namesOf = (value: string | undefined) =>
  (value ?? '')
    .split(',')
    .map((name) => name.trim().replace(/\s+/g, ' '))
    .filter(Boolean);

// A review as plain text: line breaks for the <br> a site keeps it with,
// its other tags dropped, its entities written out
export const plainOf = (value: string | undefined) =>
  text(
    value
      ?.replace(/<br\s*\/?>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&quot;/g, '"')
      .replace(/&#39;|&apos;/g, '’')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&'),
  );

// A title with its series after it in brackets, as Goodreads writes them,
// "Leviathan Wakes (The Expanse, #1)": the title, and the series apart
export function titleOf(value: string) {
  const match = value.match(/^(.*\S)\s*\(([^()#]+?),?\s*#(\d+(?:\.\d+)?)\)$/);
  if (!match) return { title: value.trim() };
  return {
    title: match[1],
    series: { name: match[2].trim(), number: Number(match[3]) },
  };
}

// How a copy's bound, from the words a site uses for its format: on paper
// (in boards, in paper, pocket-sized), or not on paper at all
export function formatOf(value: string | undefined): {
  format?: BookFormat;
  nonPhysical?: NonPhysicalWay;
} {
  const words = value?.toLowerCase() ?? '';
  if (/audio|mp3/.test(words)) return { nonPhysical: 'audiobook' };
  if (/kindle|ebook|e-book|digital|nook|kobo/.test(words))
    return { nonPhysical: 'ebook' };
  if (/mass market|pocket/.test(words)) return { format: 'pocket' };
  if (/hardcover|hardback|library binding/.test(words))
    return { format: 'hardcover' };
  if (/paperback|softcover/.test(words)) return { format: 'paperback' };
  return {};
}
