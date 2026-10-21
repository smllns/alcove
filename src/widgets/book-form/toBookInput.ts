import type { BookInput } from '@/entities/book/types';
import {
  isTranslation,
  placeOf,
  type DraftExtras,
  type DraftFields,
} from './draft';
import { sources } from '@/entities/book/acquired';
import { tidyLists, type DraftLists } from './entries';

// The draft as the API wants it: text turned into numbers and lists, blanks
// left out, and only what's on show (a translator only for a translation)

const whole = (value: string) => {
  const n = Number(value.trim());
  return value.trim() && Number.isInteger(n) ? n : undefined;
};

const optional = (value: string) => value.trim() || undefined;

const number = (value: string) => {
  const n = Number(value.trim().replace(',', '.'));
  return value.trim() && Number.isFinite(n) ? n : undefined;
};

// "Ann Smith, Bo Lee" → ['Ann Smith', 'Bo Lee']
const names = (value: string) =>
  value
    .split(',')
    .map((name) => name.trim())
    .filter(Boolean);

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
    authors: names(fields.authors),
    isbn: optional(fields.isbn),
    publisher: optional(fields.publisher),
    firstPublishedYear: whole(fields.firstPublishedYear),
    publishedYear: whole(fields.publishedYear),
    pages: whole(fields.pages),
    format: fields.format || undefined,
    language: optional(fields.language),
    originalLanguage: optional(fields.originalLanguage),
    // Kept only while the languages differ, which is when they're shown
    ...(isTranslation(fields) && {
      originalTitle: optional(fields.originalTitle),
      translators: names(fields.translators),
    }),
    series: fields['series.name'].trim()
      ? {
          name: fields['series.name'].trim(),
          number: number(fields['series.number']),
        }
      : undefined,
    description: optional(fields.description),
    averageRating: number(fields.averageRating),
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
      started: optional(fields['copy.started']),
      finished: optional(fields['copy.finished']),
      rating: number(fields['copy.rating']) || undefined,
      acquired: {
        how:
          fields['copy.acquired.how'] === 'other'
            ? optional(fields['copy.acquired.other'])
            : optional(fields['copy.acquired.how']),
        // Only for a way it's shown with, e.g. not for a book found
        from:
          fields['copy.acquired.how'] in sources
            ? optional(fields['copy.acquired.from'])
            : undefined,
        date: optional(fields['copy.acquired.date']),
      },
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
