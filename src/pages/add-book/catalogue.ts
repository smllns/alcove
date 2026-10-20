import type {
  BookCover,
  CatalogueEdition,
  CatalogueWork,
} from '@/entities/book/types';
import { emptyFields, type DraftExtras, type DraftFields } from './draft';

// Turning what the catalogue knows into a draft of the form

const text = (value: string | number | null | undefined) =>
  // The catalogue sometimes says null where it means nothing
  value === undefined || value === null ? '' : String(value);

// The fields that belong to one printing, for switching editions. With
// none chosen they empty, all but the year, which the work still knows.
export const editionFields = (
  edition: CatalogueEdition | null,
): Partial<DraftFields> =>
  edition
    ? {
        isbn: text(edition.isbn),
        publisher: text(edition.publisher),
        publishedYear: text(edition.publishedYear),
        pages: text(edition.pages),
      }
    : { isbn: '', publisher: '', pages: '' };

export const catalogueCover = (
  url: string | undefined,
): BookCover | undefined => (url ? { url, source: 'openlibrary' } : undefined);

// What else changes with the chosen edition. With none of the catalogue's
// printings, those details are the reader's to give.
export function extrasForEdition(
  extras: DraftExtras,
  edition: CatalogueEdition | null,
): DraftExtras {
  if (!edition) {
    return {
      ...extras,
      language: undefined,
      openLibrary: { ...extras.openLibrary, edition: undefined },
    };
  }
  return {
    ...extras,
    language: edition.language,
    openLibrary: { ...extras.openLibrary, edition: edition.editionKey },
    // A photo the reader uploaded stays; otherwise follow the edition
    cover:
      extras.cover?.source === 'upload'
        ? extras.cover
        : (catalogueCover(edition.coverUrl) ?? extras.cover),
  };
}

// Every distinct cover the catalogue has for this book, to choose between:
// the one it started with first, then each edition's
export const coverChoices = (
  start: BookCover | undefined,
  editions: CatalogueEdition[],
) =>
  [
    ...new Set(
      [start?.source === 'upload' ? undefined : start?.url]
        .concat(editions.map((e) => e.coverUrl))
        .filter((url): url is string => Boolean(url)),
    ),
  ].slice(0, 11);

// A starting draft from a catalogue pick. The work gives the canonical title
// and authors; the edition gives the details of this particular copy.
export function draftFromCatalogue(
  work: CatalogueWork,
  edition?: CatalogueEdition,
) {
  const fields: DraftFields = {
    ...emptyFields,
    title: work.title,
    subtitle: text(work.subtitle),
    authors: work.authors.join(', '),
    publishedYear: text(work.firstPublishYear),
    ...(edition && editionFields(edition)),
  };
  const extras: DraftExtras = {
    cover: catalogueCover(edition?.coverUrl ?? work.coverUrl),
    language: edition?.language,
    openLibrary: { work: work.workKey, edition: edition?.editionKey },
  };
  return { fields, extras };
}
