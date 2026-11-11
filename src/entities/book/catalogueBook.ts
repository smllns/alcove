import type { Book, CatalogueWork } from './types';

const PREFIX = 'work-';

// Whether a work is one the catalogue has a page for: not another reader's
// own book (book-…) nor one kept only by its title (typed-…)
export const inCatalogue = (workKey: string) => /^OL\d+W$/.test(workKey);

// A work from the catalogue as a book, for its page: what the catalogue
// says of it (or, one typed in by hand, all the reader said of it), and
// none of a reader's own (no copy, no lists of theirs); one in a list,
// made when it was put in
export const catalogueBook = (work: CatalogueWork): Book => ({
  id: PREFIX + work.workKey,
  title: work.title,
  subtitle: work.subtitle,
  authors: work.authors,
  isbn: work.isbn,
  firstPublishedYear: work.firstPublishYear,
  averageRating: work.averageRating,
  ...work.details,
  cover:
    work.details?.cover ??
    (work.coverUrl ? { url: work.coverUrl, source: 'openlibrary' } : undefined),
  // Only one the catalogue knows points to it
  openLibrary: inCatalogue(work.workKey) ? { work: work.workKey } : undefined,
  createdAt: work.addedAt ?? '',
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
        averageRating: book.averageRating,
        addedAt: book.createdAt || undefined,
        isbn: book.isbn,
      }
    : undefined;

// Whether a work is one kept in lists as it came from another site or
// typed in by hand (typed-…), not the catalogue's
export const isTyped = (workKey: string) => workKey.startsWith('typed-');

// Whether it's another reader's own book the catalogue doesn't know
// (book-…), as alcove has it from their shelves; and that book's id
const READERS = 'book-';
export const isReadersOwn = (workKey: string) => workKey.startsWith(READERS);
export const readersOwnId = (workKey: string) => workKey.slice(READERS.length);
