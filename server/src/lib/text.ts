// Text without capitals or accents, as names and titles are compared:
// "Brontë" is "bronte", "Алёхина" is "алехина"
export const unaccented = (text: string) =>
  text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

// Text to look for as it is inside a regular expression, nothing in it
// read as a pattern
export const escapedForRegex = (text: string) =>
  text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// A name with its spaces tidied: none at the ends, one between words
export const tidyName = (name: string) => name.trim().replace(/\s+/g, ' ');

// Two names the same but for capitals: "Summer reads", "summer Reads"
export const sameButCase = (a: string, b: string) =>
  a.localeCompare(b, 'en', { sensitivity: 'accent' }) === 0;

// Cyrillic in Latin letters (lower case), so a name written either way can
// be compared: "куприн" is kuprin. Mirrors src/shared/lib/spelling.ts.
const LATIN: Record<string, string> = Object.fromEntries(
  (
    'а:a б:b в:v г:g д:d е:e ё:e ж:zh з:z и:i й:i к:k л:l м:m н:n о:o п:p ' +
    'р:r с:s т:t у:u ф:f х:kh ц:ts ч:ch ш:sh щ:shch ъ: ы:y ь: э:e ю:yu ' +
    'я:ya і:i ї:i є:e ґ:g'
  )
    .split(' ')
    .map((pair) => pair.split(':')),
);
export const inLatin = (text: string) =>
  [...text.toLowerCase()].map((letter) => LATIN[letter] ?? letter).join('');

// A title as titles are compared, in any alphabet: without case, accents,
// punctuation or what follows a colon or a bracket ("Cat's Cradle (Penguin
// Modern Classics)" is "Cat's Cradle"). Mirrors src/entities/book/matches.ts.
export const titleKey = (title: string) =>
  unaccented(title.split(/[:(]/)[0]).replace(/[^\p{L}\p{N}]/gu, '');
