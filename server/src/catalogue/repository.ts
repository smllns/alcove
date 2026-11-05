import type { AnyBulkWriteOperation } from 'mongodb';
import { editions, type CatalogueEditionDoc } from '../db.js';
import type { BookInput } from '../books/schemas.js';
import { isbn13, type WorkResult } from '../lookup/openLibrary.js';

// alcove's own catalogue of printings (CatalogueEditionDoc), filled as
// books are added, brought over and looked up, and asked where Open
// Library doesn't know a book. Never in the way: a failure here leaves
// what it was part of as it was.

// What's kept of a printing, as it's given
export type EditionDetails = Partial<
  Omit<
    CatalogueEditionDoc,
    '_id' | 'fromOpenLibrary' | 'added' | 'createdAt' | 'updatedAt'
  >
> & { isbn?: string; title: string };

// A book a reader adds, as the catalogue takes it: only what's printed in
// it, its cover only if it's Open Library's (a photo is the reader's own)
export const detailsOf = (book: BookInput): EditionDetails => ({
  isbn: book.isbn,
  title: book.title,
  subtitle: book.subtitle,
  authors: book.authors,
  publisher: book.publisher,
  publishedYear: book.publishedYear,
  firstPublishedYear: book.firstPublishedYear,
  pages: book.pages,
  format: book.format,
  language: book.language,
  workKey: book.openLibrary?.work,
  coverUrl: book.cover?.source === 'openlibrary' ? book.cover.url : undefined,
});

// A book Open Library found by an ISBN, as the catalogue takes it
export const detailsOfWork = (
  isbn: string,
  work: WorkResult,
): EditionDetails => ({
  isbn,
  title: work.title,
  subtitle: work.subtitle,
  authors: work.authors,
  workKey: work.workKey,
  coverUrl: work.coverUrl,
  firstPublishedYear: work.firstPublishYear,
});

const FIELDS = [
  'title',
  'subtitle',
  'authors',
  'publisher',
  'publishedYear',
  'firstPublishedYear',
  'pages',
  'format',
  'language',
  'coverUrl',
  'workKey',
] as const;

// Each printing kept, in one go: Open Library's details over whatever was
// there (`trusted`), readers' only where nothing was; `counted`, a copy
// added (not only looked up). Those with no ISBN are left out.
async function keep(
  books: EditionDetails[],
  { trusted, counted }: { trusted: boolean; counted: boolean },
) {
  const writes: AnyBulkWriteOperation<CatalogueEditionDoc>[] = [];
  for (const book of books) {
    const id = isbn13(book.isbn);
    if (!id) continue;
    const fields = Object.fromEntries(
      FIELDS.flatMap((field) => {
        const value = book[field];
        if (value === undefined || (Array.isArray(value) && !value.length))
          return [];
        const given = { $literal: value };
        return [[field, trusted ? given : { $ifNull: [`$${field}`, given] }]];
      }),
    );
    writes.push({
      updateOne: {
        filter: { _id: id },
        update: [
          {
            $set: {
              ...fields,
              fromOpenLibrary: trusted
                ? true
                : { $ifNull: ['$fromOpenLibrary', false] },
              added: { $add: [{ $ifNull: ['$added', 0] }, counted ? 1 : 0] },
              createdAt: { $ifNull: ['$createdAt', '$$NOW'] },
              updatedAt: '$$NOW',
            },
          },
        ],
        upsert: true,
      },
    });
  }
  if (writes.length)
    await editions()
      .bulkWrite(writes, { ordered: false })
      .catch(() => {});
}

// Copies readers added (or changed): what they said of each fills in
// what the catalogue doesn't know yet
export const rememberAdded = (books: BookInput[]) =>
  keep(books.map(detailsOf), { trusted: false, counted: true });

// A copy changed: the same, not counted again
export const rememberChanged = (book: BookInput) =>
  keep([detailsOf(book)], { trusted: false, counted: false });

// Books readers keep only by name (wanted, not found): the same, uncounted
export const rememberNamed = (books: EditionDetails[]) =>
  keep(books, { trusted: false, counted: false });

// Printings Open Library told of, as it told
export const rememberFound = (books: EditionDetails[]) =>
  keep(books, { trusted: true, counted: false });

// A printing as the client sees it
const toEdition = ({ _id, ...doc }: CatalogueEditionDoc) => ({
  isbn: _id,
  title: doc.title,
  subtitle: doc.subtitle,
  authors: doc.authors ?? [],
  publisher: doc.publisher,
  publishedYear: doc.publishedYear,
  firstPublishedYear: doc.firstPublishedYear,
  pages: doc.pages,
  format: doc.format,
  language: doc.language,
  coverUrl: doc.coverUrl,
});
export type OurEdition = ReturnType<typeof toEdition>;

// The printing an ISBN is of, as alcove knows it, if it does
export async function ourEdition(isbn: string) {
  const id = isbn13(isbn);
  const doc = id
    ? await editions()
        .findOne({ _id: id })
        .catch(() => null)
    : null;
  return doc ? toEdition(doc) : null;
}

// Printings Open Library doesn't know whose titles or writers have the
// words of `query`, the closest first, the most added among equals
export async function searchOurs(query: string, limit = 5) {
  const docs = await editions()
    .find(
      { $text: { $search: query }, fromOpenLibrary: false },
      { projection: { score: { $meta: 'textScore' } } },
    )
    .sort({ score: { $meta: 'textScore' }, added: -1 })
    .limit(limit)
    .toArray()
    .catch(() => []);
  return docs.map(toEdition);
}
