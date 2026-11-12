import { useSyncExternalStore } from 'react';
import { inLatin, misspelt } from '@/shared/lib/spelling';
import { searchable } from './matches';
import type { Book } from './types';

// A writer told apart from others however their name is written: in
// either alphabet, transliterated one way or another, surname first or
// last, with initials or names in full

// A word as it sounds, however it was put in Latin letters: "Достоевский",
// "Dostoevsky" and "Dostoyevskiy" are all dostoevski; "Мазох" and the
// German "Masoch" both masoh, "Уэлш" and "Welsh" velsh
const sound = (word: string) =>
  inLatin(searchable(word))
    .replace(/ye/g, 'e')
    // A yo is ё within a word (Fyodor), but Йо at its start (Yoav)
    .replace(/(?<=.)yo/g, 'e')
    .replace(/yu/g, 'u')
    .replace(/ya/g, 'a')
    .replace(/kh/g, 'h')
    .replace(/ch/g, 'h')
    .replace(/z/g, 's')
    .replace(/ks/g, 'x')
    .replace(/ph/g, 'f')
    .replace(/w/g, 'v')
    // A W before an E, as Russian writes it: "Уэлш" for Welsh
    .replace(/^ue/, 've')
    .replace(/c(?!h)/g, 'k')
    .replace(/[yj]/g, 'i')
    .replace(/(.)\1+/g, '$1');

// Words after a surname that aren't one
const AFTER = new Set(['jr', 'sr', 'ii', 'iii']);

// A name's surname and first name (none for a name of one word): the
// surname is the last word, or what's before a comma
function parsed(name: string) {
  const [before, after] = name.split(',', 2);
  const words = (text = '') =>
    text
      .split(/[^\p{L}]+/u)
      .filter((word) => word && !AFTER.has(searchable(word)));
  const front = words(before);
  return after?.trim()
    ? { surname: front.join(' '), first: words(after)[0] }
    : {
        surname: front.at(-1) ?? name,
        first: front.length > 1 ? front[0] : '',
      };
}

// A writer as told apart from others: the first letter of their first
// name and their surname as it sounds, so "Лев Толстой" is Leo Tolstoy and
// "Достоевский, Фёдор Михайлович" Fyodor Dostoevsky
// Worked out once per name: the same names come up over and over, matching
// the whole shelf against a writer
const keys = new Map<string, string>();
const spelled = (name: string) => {
  const { surname, first } = parsed(name);
  return `${first ? sound(first)[0] : ''}:${sound(surname)}`;
};
export function writerKey(name: string) {
  const known = keys.get(name);
  if (known !== undefined) return known;
  const raw = spelled(name);
  const key = merged.get(raw) ?? raw;
  keys.set(name, key);
  return key;
}

// Writers found to be one under names that don't sound alike ("Annie
// Ernaux", "Анни Эрно": one person on Wikidata, as the server knows from
// finding them, sameWriters): each of a writer's names told as the first
// of them, and so every other way of writing those
const merged = new Map<string, string>();
// How many times that's been told, and who's to hear of it next time
let told = 0;
const listeners = new Set<() => void>();
export function knowSameWriters(groups: string[][]) {
  told += 1;
  merged.clear();
  keys.clear();
  for (const group of groups) {
    const [first, ...rest] = group.map(spelled);
    for (const key of rest) if (key !== first) merged.set(key, first);
  }
  listeners.forEach((listener) => listener());
}
const listen = (listener: () => void) => {
  listeners.add(listener);
  return () => void listeners.delete(listener);
};

// How many times who's one has been told, for what's worked out of
// writers to be worked out again (a memo's dependency), and drawn again
export const useWritersKnown = () => useSyncExternalStore(listen, () => told);

// Two keys a letter apart in the surname, with the same first letter, are
// one writer misspelled
export const nearlySame = (a: string, b: string) => {
  const [first, surname] = a.split(':');
  const [other, theirs] = b.split(':');
  return first === other && misspelt(surname, theirs);
};

// What tells one way of writing a name from another: the letters of their
// first name and surname, middle names and initials aside
export const nameLetters = (name: string) => {
  const { surname, first } = parsed(name);
  return searchable(first + surname).replace(/[^\p{L}]/gu, '');
};

// Whether two names are one writer's, however they're written
export function sameWriter(one: string, other: string) {
  const [a, b] = [writerKey(one), writerKey(other)];
  return a === b || nearlySame(a, b);
}

// Whether a book names the writer among its authors
export const namesWriter = (book: Book, name: string) =>
  book.authors.some((each) => sameWriter(each, name));
