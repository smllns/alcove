import type { Book } from '@/entities/book/types';
import { hasCyrillic, misspelt } from '@/shared/lib/spelling';

// One thing the books name in several ways (a publisher, an author), told
// by a key its every spelling shares

// Its books, how many give it each name, and the first name it was found by
export type Gathered = {
  books: Book[];
  names: Map<string, number>;
  first: string;
  // Names of others counted with it (a publisher's imprints) too
  every: Map<string, number>;
};

const counted = (names: Map<string, number>, name: string, many = 1) =>
  names.set(name, (names.get(name) ?? 0) + many);

// A name as written, without marks that only steer the text's direction,
// unseen, or spaces over
const tidy = (name: string) =>
  name
    .replace(/\p{Cf}/gu, '')
    .trim()
    .replace(/\s+/g, ' ');

// The books by what they name (`namesOf`), names with the same key
// (`keyOf`), or keys that are one misspelled (`near`, a letter apart),
// counted as one; each book once in each
export function gather(
  books: Book[],
  namesOf: (book: Book) => (string | undefined)[],
  keyOf: (name: string) => string,
  near = misspelt,
) {
  const by = new Map<string, Gathered>();
  for (const book of books)
    for (const written of namesOf(book)) {
      const name = written && tidy(written);
      if (!name) continue;
      const key = keyOf(name);
      const known = by.has(key)
        ? key
        : ([...by.keys()].find((other) => near(key, other)) ?? key);
      const held: Gathered = by.get(known) ?? {
        books: [],
        names: new Map(),
        first: name,
        every: new Map(),
      };
      if (held.books.at(-1) !== book) held.books.push(book);
      counted(held.names, name);
      counted(held.every, name);
      by.set(known, held);
    }
  return [...by.values()];
}

// `others` counted with `one` (an imprint with its publisher)
export function joined(one: Gathered, others: Gathered) {
  one.books.push(...others.books);
  for (const [name, many] of others.names) counted(one.every, name, many);
}

// The name a thing written several ways goes by: the way most of its books
// have it, all but what `own` keeps aside ("HarperCollins" for "Harper
// Collins Publishers"); among equals, in the alphabet most have it in,
// then the fullest (a misspelling is likelier a letter short than over),
// and as written on the fewest marks besides ("Penguin Books", not
// "Penguin Books, Limited")
export function nameOf(
  { names, every }: Gathered,
  own: (name: string) => string,
) {
  const all = [...names];
  const books = (
    has: (name: string) => boolean,
    among: [string, number][] = all,
  ) => among.reduce((sum, [name, many]) => sum + (has(name) ? many : 0), 0);
  const best = (name: string) => [
    books((other) => own(other) === own(name)),
    books((other) => hasCyrillic(other) === hasCyrillic(name), [...every]),
    own(name).length,
    -name.length,
  ];
  const ahead = (a: number[], b: number[]) =>
    a.findIndex((each, i) => each !== b[i]);
  return all
    .map(([name]) => ({ name, score: best(name) }))
    .sort((a, b) => {
      const at = ahead(a.score, b.score);
      return at < 0 ? 0 : b.score[at] - a.score[at];
    })[0].name;
}
