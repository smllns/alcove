import { nameWords, soundsSame, spellings } from '../lib/sounds.js';
import { cached } from './cache.js';
import { searchAuthors } from './authors.js';
import { inLatin } from '../lib/text.js';
import { words } from './wikipedia.js';

// Writers found in the catalogue by their name, for their key there (and
// so their books)

// A writer the reader has in Cyrillic whom neither the catalogue nor
// Wikipedia nor Wikidata knows by that name ("Рафаэль Боб-Ваксберг", a
// Russian edition of Raphael Bob-Waksberg): looked for in the catalogue by
// the ways their surname may be put in Latin letters, all at once, and
// taken only when their whole name sounds as the reader's does; of those,
// the one with the most books. None when the name isn't in Cyrillic, or no
// one sounds like it.

// How many writers are weighed
const WEIGHED = 20;

export async function soundAlike(name: string) {
  if (!/\p{Script=Cyrillic}/u.test(name)) return undefined;
  const surname = nameWords(name).at(-1);
  if (!surname) return undefined;
  const query = spellings(surname).join(' OR ');
  const found = await cached(`soundalike1:${query}`, 7, () =>
    searchAuthors(query, WEIGHED),
  );
  return found.find((each) => soundsSame(each.name, name));
}

// The catalogue's key for a writer by their name in English, as Wikidata
// gives it (one put in in Russian is seldom found by that): the writer
// with the most books whose name has every word of it, in either alphabet
export async function catalogueKey(english: string) {
  const wanted = words(english);
  const found = await cached(`authors1:${english.toLowerCase()}`, 7, () =>
    searchAuthors(english),
  );
  // The catalogue may keep its main record in Cyrillic ("Александр
  // Иванович Куприн", with 112 books, over "Aleksandr Kuprín" with 23)
  return found.find((each) => {
    const theirs = words(inLatin(each.name));
    return wanted.every((word) => theirs.includes(word));
  })?.key;
}
