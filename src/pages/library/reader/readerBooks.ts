import { catalogueBook } from '@/entities/book/catalogueBook';
import type { Book, CatalogueWork } from '@/entities/book/types';
import type { ReaderBook, ReaderPage } from '@/entities/reader/types';
import { callName } from '@/entities/user/types';
import { halves } from '@/shared/lib/halves';

// A reader's books as their page shows them, from what the server lets be
// seen of them (ReaderBook)

// One as a book from the catalogue, for a grid of them (WorkGrid): one the
// catalogue doesn't know opens what's known of it here
export const asWork = (book: ReaderBook): CatalogueWork => ({
  workKey: book.workKey,
  title: book.title,
  authors: book.authors,
  coverUrl: book.coverUrl,
  firstPublishYear: book.firstPublishedYear,
  editionCount: 0,
});

// One as a book of the app's, for what's worked out of books (favourite
// authors, the months of a year) and drawn of them: the catalogue's book
// (catalogueBook) with their stars, reading and quotes in its copy;
// opening the reader's own copy of it (`owned`, by work), or else its page
// in the catalogue
export function asBook(book: ReaderBook, owned: Map<string, Book>): Book {
  const known = catalogueBook(asWork(book));
  return {
    ...known,
    id: owned.get(book.workKey)?.id ?? known.id,
    pages: book.pages,
    copy: {
      status: 'shelf',
      rating: book.rating,
      reading: book.reading,
      started: book.started,
      finished: book.finished,
      quotes: book.quotes,
    },
    createdAt: book.addedAt,
    updatedAt: book.addedAt,
  };
}

// What's said under each of a reader's books in a grid: the stars they gave
// it, as theirs ("Anna ★ 4½")
export function theirStars(page: ReaderPage) {
  const stars = new Map(page.books.map((book) => [book.workKey, book.rating]));
  const them = callName(page);
  return (work: CatalogueWork) => {
    const given = stars.get(work.workKey);
    return given ? `${them} ★ ${halves(given)}` : undefined;
  };
}

// The reader's own books on their own page, by work, as the books there
// are theirs: each opening itself
export const ownedOf = (books: ReaderBook[]) =>
  new Map(
    books.map((book) => [
      book.workKey,
      {
        id: book.id,
        title: book.title,
        authors: book.authors,
        copy: { status: 'shelf', rating: book.rating },
        createdAt: book.addedAt,
        updatedAt: book.addedAt,
      } satisfies Book,
    ]),
  );

// Those being read now, the latest begun first
export const readingNow = (books: ReaderBook[]) =>
  books
    .filter((book) => book.reading === 'reading')
    .toSorted((a, b) => (b.started ?? '').localeCompare(a.started ?? ''));

// `year` in reading: the books finished in it, their pages, the stars
// they were given on average (none given, null) and those finished in each
// month
export function yearOf(books: ReaderBook[], year: number) {
  const read = books.filter(
    (book) =>
      book.reading === 'read' && book.finished?.startsWith(String(year)),
  );
  const stars = read.flatMap((book) => book.rating ?? []);
  return {
    read,
    pages: read.reduce((sum, book) => sum + (book.pages ?? 0), 0),
    average: stars.length ? stars.reduce((a, b) => a + b) / stars.length : null,
    months: Array.from({ length: 12 }, (_, m) =>
      read.filter((book) => Number(book.finished!.slice(5, 7)) === m + 1),
    ),
  };
}

// What the reader looking and another have in common: the books both have
// (`owned`, useOwned), each with the stars both gave, the best loved
// first, and how many both gave five stars
export function inCommon(theirs: ReaderBook[], owned: Map<string, Book>) {
  const both = theirs.flatMap((book) => {
    const copy = owned.get(book.workKey);
    return copy ? [{ book, mine: copy.copy?.rating, theirs: book.rating }] : [];
  });
  return {
    books: both.toSorted(
      (a, b) =>
        (b.mine ?? 0) + (b.theirs ?? 0) - ((a.mine ?? 0) + (a.theirs ?? 0)),
    ),
    loved: both.filter((each) => each.mine === 5 && each.theirs === 5).length,
  };
}
