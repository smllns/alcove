import { inLatin, unaccented } from './text.js';

// A name as it sounds, however it was put in Latin letters, so a writer
// the reader has in Cyrillic is known in the catalogue's Latin: "Рафаэль
// Боб-Ваксберг" sounds as Raphael Bob-Waksberg does. Mirrors the sound of
// a word in src/entities/book/writers.ts.

const sound = (word: string) =>
  inLatin(unaccented(word))
    .replace(/ye/g, 'e')
    .replace(/(?<=.)yo/g, 'e')
    .replace(/yu/g, 'u')
    .replace(/ya/g, 'a')
    .replace(/kh/g, 'h')
    .replace(/ch/g, 'h')
    .replace(/z/g, 's')
    .replace(/ks/g, 'x')
    .replace(/ph/g, 'f')
    .replace(/w/g, 'v')
    .replace(/^ue/, 've')
    .replace(/c(?!h)/g, 'k')
    .replace(/[yj]/g, 'i')
    .replace(/(.)\1+/g, '$1');

// A name's words in the order they're said, first name first: "Боб-
// Ваксберг, Рафаэль" is рафаэль боб ваксберг
export const nameWords = (name: string) => {
  const [before, after] = name.split(',', 2);
  const words = (text = '') => text.split(/[^\p{L}]+/u).filter(Boolean);
  return [...words(after), ...words(before)];
};

// Whether two names sound alike, word for word
export const soundsSame = (one: string, other: string) => {
  const [a, b] = [nameWords(one).map(sound), nameWords(other).map(sound)];
  return a.length === b.length && a.every((word, i) => word === b[i]);
};

// Ways a word in Cyrillic may be put in Latin letters ("Ваксберг":
// vaksberg, waksberg, vaxberg, waxberg), for looking a writer up by: the
// plain way, with each of these told the other way as well
const OTHERWISE: [RegExp, string][] = [
  [/v/g, 'w'],
  [/ks/g, 'x'],
  [/f/g, 'ph'],
  [/kh/g, 'h'],
  [/i\b/g, 'y'],
];
// The most looked for at once
const MOST = 8;
export function spellings(word: string) {
  let all = [inLatin(unaccented(word))];
  for (const [from, to] of OTHERWISE)
    if (all[0].search(from) >= 0)
      all = [...all, ...all.map((each) => each.replace(from, to))];
  return [...new Set(all)].slice(0, MOST);
}
