// Russian put in Latin letters the way libraries do it (ALA-LC, as Open
// Library has much of it: "Zolushka beremennai︠a︡", "Kniga mërtvykh"), put
// back in Cyrillic: "Золушка беременная", "Книга мёртвых". The library way
// is made to go back: a tie joins the two letters of one (i͡a, t͡s; written
// as one mark over both, or as its two halves, one over each), ʹ is a soft
// sign, ĭ (or ǐ) a й, ė an э. Worked on with every mark apart from its
// letter (NFD), as the catalogue may write them either way. The marks are
// named by their numbers, being all but invisible written out.

const char = (code: number) => String.fromCodePoint(code);
const TIE = char(0x361);
const TIE_LEFT = char(0xfe20);
const TIE_RIGHT = char(0xfe21);
const SOFT = char(0x2b9);
const HARD = char(0x2ba);
const BREVE = char(0x306);
const CARON = char(0x30c);
const DOT = char(0x307);
const DIAERESIS = char(0x308);
const MACRON = char(0x304);

// What gives a title away as put in Latin letters the library way: a tie,
// either half of one, a soft or hard sign, a breve, caron or dot over a
// letter
const MARKS = [TIE, TIE_LEFT, TIE_RIGHT, SOFT, HARD, BREVE, CARON, DOT];
export const looksRomanized = (text: string) => {
  // Cyrillic already (whose й has a breve too): not put in Latin letters
  if (/\p{Script=Cyrillic}/u.test(text)) return false;
  const apart = text.normalize('NFD');
  return MARKS.some((mark) => apart.includes(mark));
};

// The longest first, so "shch" is щ before "sh" is ш
const LETTERS: [string, string][] = [
  ['shch', 'щ'],
  [`i${TIE}a`, 'я'],
  [`i${TIE}u`, 'ю'],
  [`t${TIE}s`, 'ц'],
  ['zh', 'ж'],
  ['kh', 'х'],
  ['ch', 'ч'],
  ['sh', 'ш'],
  [`i${BREVE}`, 'й'],
  [`i${CARON}`, 'й'],
  [`e${DOT}`, 'э'],
  [`e${DIAERESIS}`, 'ё'],
  // The і of the old spelling: "sobranīe", собраніе
  [`i${MACRON}`, 'і'],
  [HARD, 'ъ'],
  [SOFT, 'ь'],
  ['a', 'а'],
  ['b', 'б'],
  ['v', 'в'],
  ['g', 'г'],
  ['d', 'д'],
  ['e', 'е'],
  ['z', 'з'],
  ['i', 'и'],
  ['k', 'к'],
  ['l', 'л'],
  ['m', 'м'],
  ['n', 'н'],
  ['o', 'о'],
  ['p', 'п'],
  ['r', 'р'],
  ['s', 'с'],
  ['t', 'т'],
  ['u', 'у'],
  ['f', 'ф'],
  ['y', 'ы'],
];

// Ends of words often written without their tie: "-aia", "-iia" (ая, ия)
const UNTIED = /(?<=[aeiouy])i(?=[au]\b)|(?<=i)i(?=[au]\b)/g;
// An apostrophe of any kind, for a soft sign
const APOSTROPHES = ["'", char(0x2019), char(0x2bc)];
// Marks left over on letters they say nothing about
const LEFT_OVER = new RegExp(
  `[${char(0x300)}-${char(0x36f)}${TIE_LEFT}-${char(0xfe2f)}]`,
  'g',
);

export function fromRomanized(text: string) {
  // One way of writing each: a tie as one mark after its first letter, an
  // untied ending tied, ʹ for an apostrophe
  let tidy = text.normalize('NFD').split(TIE_LEFT).join(TIE);
  tidy = tidy.split(TIE_RIGHT).join('');
  for (const mark of APOSTROPHES) tidy = tidy.split(mark).join(SOFT);
  tidy = tidy.replace(UNTIED, `i${TIE}`);
  let out = '';
  for (let at = 0; at < tidy.length;) {
    const rest = tidy.slice(at);
    const lower = rest.toLowerCase();
    const pair = LETTERS.find(([latin]) => lower.startsWith(latin));
    if (!pair) {
      out += rest[0];
      at += 1;
      continue;
    }
    const [latin, cyrillic] = pair;
    // As capital as what it stands for begins
    out +=
      rest[0] !== rest[0].toLowerCase() ? cyrillic.toUpperCase() : cyrillic;
    at += latin.length;
  }
  // Left over before the letters are put back together, so none joins one
  // into another letter (и with a macron is ӣ)
  return out.replace(LEFT_OVER, '').normalize('NFC');
}

// A title (or a name) as the reader would want it: put back in Cyrillic
// when it's plainly Russian put in Latin letters, by the library marks in
// it, or by the catalogue saying all its editions are in Russian
// (`languages`, as Open Library writes them: "rus") while it's written in
// Latin letters
export function readableTitle(title: string, languages?: string[]) {
  const russian =
    Boolean(languages?.length) && languages!.every((lang) => lang === 'rus');
  const latin = /^[\p{Script=Latin}\p{M}\p{N}\p{P}\p{Zs}\p{Lm}]+$/u.test(title);
  return looksRomanized(title) || (russian && latin)
    ? fromRomanized(title)
    : title;
}
