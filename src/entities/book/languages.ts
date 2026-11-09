// Languages to pick from, as Open Library writes them (MARC codes, which the
// browser can name). The catalogue may bring others; they're named the same.
const common = [
  'eng',
  'rus',
  'ukr',
  'bel',
  'ger',
  'fre',
  'spa',
  'ita',
  'por',
  'pol',
  'cze',
  'dut',
  'swe',
  'nor',
  'dan',
  'fin',
  'hun',
  'rum',
  'bul',
  'srp',
  'hrv',
  'gre',
  'tur',
  'heb',
  'ara',
  'per',
  'hin',
  'chi',
  'jpn',
  'kor',
  'geo',
  'arm',
  'kaz',
  'lat',
];

const names = new Intl.DisplayNames(['en'], { type: 'language' });

export function languageName(code: string) {
  try {
    return names.of(code) ?? code;
  } catch {
    return code;
  }
}

// Every language to offer, by name, including `extra` (e.g. one the
// catalogue gave that isn't among the common ones)
export function languageOptions(...extra: string[]) {
  const codes = new Set([...common, ...extra.filter(Boolean)]);
  return [...codes]
    .map((code) => ({ value: code, label: languageName(code) }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

// The MARC codes that aren't the ones browsers name languages by (the
// library's own, ISO 639-2/B), each with the one they are (639-2/T)
const terminology: Record<string, string> = {
  alb: 'sqi',
  arm: 'hye',
  baq: 'eus',
  bur: 'mya',
  chi: 'zho',
  cze: 'ces',
  dut: 'nld',
  fre: 'fra',
  geo: 'kat',
  ger: 'deu',
  gre: 'ell',
  ice: 'isl',
  mac: 'mkd',
  mao: 'mri',
  may: 'msa',
  per: 'fas',
  rum: 'ron',
  slo: 'slk',
  tib: 'bod',
  wel: 'cym',
};

// A language as Wikipedia names its own: "de" for "ger"; none when not known
export function wikiLanguage(code: string | undefined) {
  if (!code) return undefined;
  try {
    return new Intl.Locale(terminology[code] ?? code).language;
  } catch {
    return undefined;
  }
}

// The language a book's own words are in, as the page is told it (for
// hyphenating them): the one it's read in, or, not knowing that, Russian
// for a title written in Cyrillic
export const titleLanguage = (book: { title: string; language?: string }) =>
  wikiLanguage(book.language) ??
  (/\p{Script=Cyrillic}/u.test(book.title) ? 'ru' : undefined);
