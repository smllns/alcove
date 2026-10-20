import type { Filter } from 'mongodb';
import type { BookDoc } from '../db.js';

// Searching a reader's own shelves. Every word typed has to turn up
// somewhere (in the title, the authors, the series…), in any order, so
// "tartt secret" finds The Secret History. Case and accents don't matter,
// nor does ё against е: "exupery" finds Exupéry.

const fields = [
  'title',
  'subtitle',
  'authors',
  'originalTitle',
  'translators',
  'series.name',
  'isbn',
] as const;

// Letters that should match one another, whichever one is typed
const alike = [
  'aàáâãäåāăą',
  'cçćč',
  'eèéêëēėęě',
  'iìíîïīį',
  'lł',
  'nñńň',
  'oòóôõöøō',
  'uùúûüūůű',
  'yýÿ',
  'sśšş',
  'zźżž',
  'её',
];

// One typed character as a pattern: itself and its look-alikes, in both
// cases (spelt out, so it doesn't rest on how the database folds case
// outside ASCII), or escaped if it's punctuation
function charPattern(char: string) {
  const lower = char.toLowerCase();
  const group = alike.find((letters) => letters.includes(lower)) ?? lower;
  const both = group + group.toUpperCase();
  if (both.length > 1 && /\p{L}/u.test(lower)) return `[${both}]`;
  return lower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const wordPattern = (word: string) =>
  new RegExp([...word].map(charPattern).join(''));

// The books matching `text`, or all of them when it's blank
export function searchFilter(text: string | undefined): Filter<BookDoc> {
  const words = (text ?? '').trim().split(/\s+/).filter(Boolean).slice(0, 8);
  if (!words.length) return {};
  return {
    $and: words.map((word) => {
      const pattern = wordPattern(word);
      return { $or: fields.map((field) => ({ [field]: pattern })) };
    }),
  };
}
