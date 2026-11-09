// Telling names apart however they're spelled: in either alphabet, or a
// letter off

// Cyrillic in Latin letters (lower case), so "ад маргинем" is ad marginem
const LATIN: Record<string, string> = Object.fromEntries(
  (
    'а:a б:b в:v г:g д:d е:e ё:e ж:zh з:z и:i й:i к:k л:l м:m н:n о:o п:p ' +
    'р:r с:s т:t у:u ф:f х:kh ц:ts ч:ch ш:sh щ:shch ъ: ы:y ь: э:e ю:yu ' +
    'я:ya і:i ї:i є:e ґ:g'
  )
    .split(' ')
    .map((pair) => pair.split(':')),
);

// Whether any of it is in Cyrillic letters
export const hasCyrillic = (text: string) => /\p{Script=Cyrillic}/u.test(text);

export const inLatin = (text: string) =>
  [...text].map((letter) => LATIN[letter] ?? letter).join('');

// How many letters one word needs changed, added or taken away to be the
// other, as far as `most`: one more than that is as good as any more
function changes(a: string, b: string, most: number) {
  if (Math.abs(a.length - b.length) > most) return most + 1;
  let row = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const next = [i];
    for (let j = 1; j <= b.length; j++)
      next[j] = Math.min(
        row[j] + 1,
        next[j - 1] + 1,
        row[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    row = next;
  }
  return row[b.length];
}

// A name this long, a letter off another, is that one misspelled
// ("Азбука-класика"); shorter ones a letter apart are often others
const MISSPELT_FROM = 6;

export const misspelt = (a: string, b: string) =>
  Math.min(a.length, b.length) >= MISSPELT_FROM && changes(a, b, 1) <= 1;
