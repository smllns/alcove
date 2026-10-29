import type { Book, CatalogueWork } from './types';

const PREFIX = 'work-';

// A work from the catalogue as a book, for its page: what the catalogue
// says of it, and none of a reader's own (no copy, no lists of theirs)
export const catalogueBook = (work: CatalogueWork): Book => ({
  id: PREFIX + work.workKey,
  title: work.title,
  subtitle: work.subtitle,
  authors: work.authors,
  firstPublishedYear: work.firstPublishYear,
  cover: work.coverUrl
    ? { url: work.coverUrl, source: 'openlibrary' }
    : undefined,
  openLibrary: { work: work.workKey },
  createdAt: '',
  updatedAt: '',
});

// The work a book stands for, when it's one from the catalogue (above)
// rather than the reader's own; as the catalogue had it, for its page
export const workOfBook = (book: Book): CatalogueWork | undefined =>
  book.id.startsWith(PREFIX)
    ? {
        workKey: book.id.slice(PREFIX.length),
        title: book.title,
        subtitle: book.subtitle,
        authors: book.authors,
        firstPublishYear: book.firstPublishedYear,
        coverUrl: book.cover?.url,
        editionCount: 0,
      }
    : undefined;
