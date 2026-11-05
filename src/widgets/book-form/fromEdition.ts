import type { OurEdition } from '@/entities/book/ourEdition';
import { catalogueCover } from './catalogue';
import {
  emptyFields,
  fieldText,
  withLanguage,
  type DraftExtras,
  type DraftFields,
} from './draft';

// A starting draft from a printing alcove knows (and Open Library doesn't):
// all that's printed in it filled in, its cover if it has one, the rest
// the reader's to give, as with a book added by hand
export function draftFromOurs(edition: OurEdition) {
  const text = fieldText;
  const fields: DraftFields = {
    ...emptyFields,
    title: edition.title,
    subtitle: text(edition.subtitle),
    authors: edition.authors.join(', '),
    isbn: edition.isbn,
    publisher: text(edition.publisher),
    publishedYear: text(edition.publishedYear),
    firstPublishedYear: text(edition.firstPublishedYear),
    pages: text(edition.pages),
    format: edition.format ?? '',
  };
  const extras: DraftExtras = { cover: catalogueCover(edition.coverUrl) };
  return {
    fields: edition.language ? withLanguage(fields, edition.language) : fields,
    extras,
  };
}
