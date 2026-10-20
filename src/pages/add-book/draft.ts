import type {
  BookCover,
  BookInput,
  CopyCondition,
  CopyStatus,
  ReadingState,
} from '@/entities/book/types';
import type { PlaceChoice } from '@/features/places';
import { tidyLists, type DraftLists } from './entries';

// The form's text fields. Everything is a string while being edited.
export type DraftFields = {
  title: string;
  subtitle: string;
  authors: string;
  isbn: string;
  publisher: string;
  publishedYear: string;
  pages: string;
  // The reader's copy. Named like the API's fields, so its errors land here.
  // The ids of the place, '' where not chosen
  'copy.place.home': string;
  'copy.place.room': string;
  'copy.place.unit': string;
  'copy.place.shelf': string;
  'copy.reading': ReadingState | '';
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
  language?: string;
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
  'copy.place.home': '',
  'copy.place.room': '',
  'copy.place.unit': '',
  'copy.place.shelf': '',
  'copy.reading': '',
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
] as const;

const whole = (value: string) => {
  const n = Number(value.trim());
  return value.trim() && Number.isInteger(n) ? n : undefined;
};

const optional = (value: string) => value.trim() || undefined;

export function toBookInput(
  fields: DraftFields,
  extras: DraftExtras,
  lists: DraftLists,
): BookInput {
  const { quotes, notes, links } = tidyLists(lists);
  const place = placeOf(fields);
  return {
    title: fields.title.trim(),
    subtitle: optional(fields.subtitle),
    authors: fields.authors
      .split(',')
      .map((name) => name.trim())
      .filter(Boolean),
    isbn: optional(fields.isbn),
    publisher: optional(fields.publisher),
    publishedYear: whole(fields.publishedYear),
    pages: whole(fields.pages),
    ...extras,
    copy: {
      place: place.home
        ? {
            home: place.home,
            room: optional(place.room),
            unit: optional(place.unit),
            shelf: optional(place.shelf),
          }
        : undefined,
      reading: fields['copy.reading'] || undefined,
      status: fields['copy.status'] || 'shelf',
      person: optional(fields['copy.person']),
      since: optional(fields['copy.since']),
      due: optional(fields['copy.due']),
      condition: fields['copy.condition'] || undefined,
      review: optional(fields['copy.review']),
      notes: notes.map((note) => note.text.trim()),
      quotes: quotes.map((quote) => quote.text.trim()),
      links: links.map((link) => ({
        label: optional(link.label),
        url: link.url.trim(),
      })),
    },
  };
}
