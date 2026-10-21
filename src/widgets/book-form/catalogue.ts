import type {
  BookCover,
  CatalogueEdition,
  CatalogueWork,
} from '@/entities/book/types';
import {
  emptyFields,
  withLanguage,
  type DraftExtras,
  type DraftFields,
} from './draft';

// Turning what the catalogue knows into a draft of the form

const text = (value: string | number | null | undefined) =>
  // The catalogue sometimes says null where it means nothing
  value === undefined || value === null ? '' : String(value);

// The fields that belong to one printing, for switching editions. With
// none chosen they empty, all but the language, which the reader may have
// set themselves.
// An edition that doesn't say its language leaves the one chosen.
const editionFields = (
  edition: CatalogueEdition | null,
): Partial<DraftFields> =>
  edition
    ? {
        isbn: text(edition.isbn),
        publisher: text(edition.publisher),
        publishedYear: text(edition.publishedYear),
        pages: text(edition.pages),
        format: edition.format ?? '',
        ...(edition.language && { language: edition.language }),
      }
    : { isbn: '', publisher: '', publishedYear: '', pages: '', format: '' };

// The draft with a different edition chosen (or none): its printing's
// details, and its language carrying the original along
export function withEdition(
  fields: DraftFields,
  edition: CatalogueEdition | null,
): DraftFields {
  const { language, ...rest } = editionFields(edition);
  const next = { ...fields, ...rest };
  return language ? withLanguage(next, language) : next;
}

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
      openLibrary: { ...extras.openLibrary, edition: undefined },
    };
  }
  return {
    ...extras,
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
// and authors, what it's about and its genres; the edition gives the
// details of this particular copy.
export function draftFromCatalogue(
  work: CatalogueWork,
  edition?: CatalogueEdition,
  details?: { description: string | null; genres: string[] },
) {
  const fields = withEdition(
    {
      ...emptyFields,
      title: work.title,
      subtitle: text(work.subtitle),
      authors: work.authors.join(', '),
      firstPublishedYear: text(work.firstPublishYear),
      description: text(details?.description),
    },
    edition ?? null,
  );
  const extras: DraftExtras = {
    genres: details?.genres,
    cover: catalogueCover(edition?.coverUrl ?? work.coverUrl),
    openLibrary: { work: work.workKey, edition: edition?.editionKey },
  };
  return { fields, extras };
}
