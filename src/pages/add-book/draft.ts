import type {
  BookCover,
  BookFormat,
  CopyCondition,
  CopyStatus,
  ReadingState,
} from '@/entities/book/types';
import type { PlaceChoice } from '@/features/places';

// The form's text fields. Everything is a string while being edited.
export type DraftFields = {
  title: string;
  subtitle: string;
  authors: string;
  isbn: string;
  publisher: string;
  publishedYear: string;
  pages: string;
  format: BookFormat | '';
  // Language codes, as Open Library writes them: eng, rus, fre…
  language: string;
  originalLanguage: string;
  // Only for a translation
  originalTitle: string;
  translators: string;
  'series.name': string;
  'series.number': string;
  // The reader's copy. Named like the API's fields, so its errors land here.
  // The ids of the place, '' where not chosen
  'copy.place.home': string;
  'copy.place.room': string;
  'copy.place.unit': string;
  'copy.place.shelf': string;
  'copy.reading': ReadingState | '';
  // Stars out of five in halves, as text: '3.5'
  'copy.rating': string;
  // One of the usual ways, or 'other' for the reader's own words
  'copy.acquired.how': string;
  'copy.acquired.other': string;
  'copy.acquired.from': string;
  'copy.acquired.date': string;
  // Nothing chosen means it's at home, same as 'shelf'
  'copy.status': CopyStatus | '';
  'copy.person': string;
  'copy.since': string;
  'copy.due': string;
  'copy.condition': CopyCondition | '';
  'copy.review': string;
};

// What goes with the text fields: what a catalogue pick brings, and genres
export type DraftExtras = {
  genres?: string[];
  cover?: BookCover;
  openLibrary?: { work?: string; edition?: string };
};

export const emptyFields: DraftFields = {
  title: '',
  subtitle: '',
  authors: '',
  isbn: '',
  publisher: '',
  publishedYear: '',
  pages: '',
  format: '',
  language: '',
  originalLanguage: '',
  originalTitle: '',
  translators: '',
  'series.name': '',
  'series.number': '',
  'copy.place.home': '',
  'copy.place.room': '',
  'copy.place.unit': '',
  'copy.place.shelf': '',
  'copy.reading': '',
  'copy.rating': '',
  'copy.acquired.how': '',
  'copy.acquired.other': '',
  'copy.acquired.from': '',
  'copy.acquired.date': '',
  'copy.status': '',
  'copy.person': '',
  'copy.since': '',
  'copy.due': '',
  'copy.condition': '',
  'copy.review': '',
};

// The book's place, gathered from its four fields and spread back into them
export const placeOf = (fields: DraftFields): PlaceChoice => ({
  home: fields['copy.place.home'],
  room: fields['copy.place.room'],
  unit: fields['copy.place.unit'],
  shelf: fields['copy.place.shelf'],
});
export const withPlace = (
  fields: DraftFields,
  place: PlaceChoice,
): DraftFields => ({
  ...fields,
  'copy.place.home': place.home,
  'copy.place.room': place.room,
  'copy.place.unit': place.unit,
  'copy.place.shelf': place.shelf,
});

// The fields on the first step, about the book itself
export const bookFieldNames = [
  'title',
  'subtitle',
  'authors',
  'isbn',
  'publisher',
  'publishedYear',
  'pages',
  'format',
  'language',
  'originalLanguage',
  'originalTitle',
  'translators',
  'series.name',
  'series.number',
] as const;

// Sets the language, and the original along with it while the two were the
// same (or the original was never set): most books are read in the
// language they were written in, and a translation is the reader's to point
// out by changing the original
export function withLanguage(
  fields: DraftFields,
  language: string,
): DraftFields {
  const follows =
    !fields.originalLanguage || fields.originalLanguage === fields.language;
  return {
    ...fields,
    language,
    ...(follows && { originalLanguage: language }),
  };
}

// Read in another language than it was written in, so it has a translator
// and perhaps a different title
export const isTranslation = (fields: DraftFields) =>
  Boolean(
    fields.language &&
    fields.originalLanguage &&
    fields.language !== fields.originalLanguage,
  );
