import type { Book } from '@/entities/book/types';
import { ways } from '@/entities/book/acquired';
import { emptyFields, type DraftExtras, type DraftFields } from './draft';
import { entryId, type DraftLists } from './entries';

// A book on the shelves, back as a draft of the form to change it: the
// other way round from toBookInput

const text = (value: string | number | undefined) =>
  value === undefined ? '' : String(value);

// One of the usual ways it came, or the reader's own words for it
const usual = (how: string) =>
  ways.some((way) => way.value === how && way.value !== 'other');

export function draftFromBook(book: Book): {
  fields: DraftFields;
  extras: DraftExtras;
  lists: DraftLists;
} {
  const copy = book.copy;
  const how = copy?.acquired?.how ?? '';
  const fields: DraftFields = {
    ...emptyFields,
    title: book.title,
    subtitle: text(book.subtitle),
    authors: book.authors.join(', '),
    isbn: text(book.isbn),
    publisher: text(book.publisher),
    firstPublishedYear: text(book.firstPublishedYear),
    publishedYear: text(book.publishedYear),
    pages: text(book.pages),
    format: book.format ?? '',
    language: text(book.language),
    originalLanguage: text(book.originalLanguage),
    originalTitle: text(book.originalTitle),
    translators: (book.translators ?? []).join(', '),
    'series.name': text(book.series?.name),
    'series.number': text(book.series?.number),
    description: text(book.description),
    averageRating: text(book.averageRating),
    'copy.place.home': text(copy?.place?.home),
    'copy.place.room': text(copy?.place?.room),
    'copy.place.unit': text(copy?.place?.unit),
    'copy.place.shelf': text(copy?.place?.shelf),
    'copy.reading': copy?.reading ?? '',
    'copy.started': text(copy?.started),
    'copy.finished': text(copy?.finished),
    'copy.rating': text(copy?.rating),
    'copy.acquired.how': how && (usual(how) ? how : 'other'),
    'copy.acquired.other': how && !usual(how) ? how : '',
    'copy.acquired.from': text(copy?.acquired?.from),
    'copy.acquired.date': text(copy?.acquired?.date),
    'copy.status': copy?.status ?? '',
    'copy.person': text(copy?.person),
    'copy.since': text(copy?.since),
    'copy.due': text(copy?.due),
    'copy.condition': copy?.condition ?? '',
    'copy.review': text(copy?.review),
  };
  const passages = (entries: string[] = []) =>
    entries.map((entry) => ({ id: entryId(), text: entry }));
  return {
    fields,
    extras: {
      genres: book.genres,
      cover: book.cover && { url: book.cover.url, source: book.cover.source },
      openLibrary: book.openLibrary,
    },
    lists: {
      notes: passages(copy?.notes),
      quotes: passages(copy?.quotes),
      links: (copy?.links ?? []).map((link) => ({
        id: entryId(),
        label: text(link.label),
        url: link.url,
      })),
    },
  };
}
