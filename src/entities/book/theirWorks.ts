import { booksByWork } from './booksByWork';
import { titleKey } from './matches';
import type { Book, SimilarBook } from './types';

// The catalogue's books of a writer's told apart from the reader's own,
// for a writer's page and a book's "by the same author"

// The catalogue's books that could be theirs by when they came out: none
// from before they were born (born in 1981, not a book of 1656 the
// catalogue puts under their name), none from long after they died (a
// translation it keeps as a book of its own, "Venus in Furs" of 1997 by a
// writer gone in 1895; what's published soon after is theirs still), and
// none from years still to come
const AFTER_DEATH = 25;
export const inTheirTime = (
  works: SimilarBook[],
  born?: number,
  died?: number,
) =>
  works.filter(
    ({ firstPublishYear: year }) =>
      !year ||
      ((!born || year >= born) &&
        (!died || year <= died + AFTER_DEATH) &&
        year <= new Date().getFullYear()),
  );

// The reader's copies of the catalogue's `works`: by the catalogue's key,
// the book's own or one the reader said is the same book;
// or else by title, theirs or the one it first came out under (one added
// by hand, or a translation, "На игле" for Trainspotting, which the
// catalogue keeps apart); or else, a translation known by neither, by the
// year it first came out, when the catalogue has just the one book of
// theirs from then. `titlesOf`: more titles for a book of the reader's, as
// it's called in other languages (useWorkTitles). One book of the reader's
// may be the copy of several works by title (the catalogue's original and
// its translations, oneWorkEach), of one at most by year.
export function copiesOf(
  theirs: Book[],
  works: SimilarBook[],
  titlesOf?: Map<string, string[]>,
) {
  const byId = new Map(theirs.map((book) => [book.id, book]));
  // By work key: theirs, and those the reader said are the same book
  const said = booksByWork(theirs);
  const byTitle = new Map<string, Book>();
  for (const book of theirs)
    for (const title of [
      book.title,
      book.originalTitle,
      ...(titlesOf?.get(book.id) ?? []),
    ])
      if (title && !byTitle.has(titleKey(title)))
        byTitle.set(titleKey(title), book);
  const found = new Map<string, Book>();
  const taken = new Set<string>();
  const match = (work: SimilarBook, book: Book | undefined) => {
    if (!book) return;
    found.set(work.workKey, book);
    taken.add(book.id);
  };
  for (const work of works)
    match(
      work,
      (work.bookId && byId.get(work.bookId)) ||
        said.get(work.workKey) ||
        byTitle.get(titleKey(work.title)),
    );
  for (const book of theirs) {
    const year = book.firstPublishedYear;
    if (taken.has(book.id) || !year) continue;
    const then = works.filter((work) => work.firstPublishYear === year);
    if (then.length === 1 && !found.has(then[0].workKey)) match(then[0], book);
  }
  return (work: SimilarBook) => {
    const book = found.get(work.workKey);
    return { book, bookId: work.bookId ?? book?.id };
  };
}

// The catalogue's works with one to each of the reader's books: of several
// that are copies of the same one (the original and a translation kept as
// a book of its own), only the first to come out stays, where it stood
export function oneWorkEach(
  works: SimilarBook[],
  copyOf: ReturnType<typeof copiesOf>,
) {
  const first = new Map<string, SimilarBook>();
  for (const work of works) {
    const id = copyOf(work).bookId;
    const before = id && first.get(id);
    if (
      id &&
      (!before ||
        (work.firstPublishYear ?? Infinity) <
          (before.firstPublishYear ?? Infinity))
    )
      first.set(id, work);
  }
  return works.filter((work) => {
    const id = copyOf(work).bookId;
    return !id || first.get(id) === work;
  });
}
