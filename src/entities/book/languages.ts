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
