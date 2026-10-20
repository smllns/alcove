import type { BookFormat } from '../db.js';

// Open Library's physical_format is free text, in many languages and cases:
// "Hardcover", "mass market paperback", "Capa Dura", "gebundene Ausgabe",
// "eBook Kindle", "Audio CD". The first rule that matches wins, so the
// narrower kinds (pocket before paperback) come first.

// Not a book you can put on a shelf
const DIGITAL = /audio|\bcd\b|mp3|e-?book|kindle|electronic|epub|digital/;

const rules: [RegExp, BookFormat][] = [
  [/mass.?market|pocket|poche|bolsillo|tascabile/, 'pocket'],
  [
    /hard|capa dura|tapa dura|gebunden|reli[eé]|cartonn[eé]|library binding|board/,
    'hardcover',
  ],
  [/paper|soft|flexi|broch|taschenbuch|brossura|r[uú]stica/, 'paperback'],
];

export const isDigital = (text: string | undefined) =>
  DIGITAL.test(text?.toLowerCase() ?? '');

export function bookFormat(text: string | undefined): BookFormat | undefined {
  const value = text?.toLowerCase();
  if (!value || isDigital(value)) return undefined;
  return rules.find(([pattern]) => pattern.test(value))?.[1];
}
