import { useLocation } from 'react-router';
import { useQueries } from '@tanstack/react-query';
import {
  authorAskOf,
  type AuthorAsk,
  type WriterPageState,
} from '@/entities/book/authorAsk';
import { authorQuery } from '@/entities/book/authorQueries';
import { useAuthorSearch } from '@/entities/book/catalogueQueries';
import type { CatalogueAuthor } from '@/entities/book/types';
import { useWriterBooks } from '@/entities/book/useWriterBooks';
import { sameWriter } from '@/entities/book/writers';
import { catalogueBook } from '@/entities/book/catalogueBook';
import { useSharedBooksBy } from '@/entities/book/sharedWorks';
import { settled } from '@/shared/lib/settled';

// How many of the reader's books by them they're asked about by
const ASKED = 3;

// How much an answer tells of them: the lines about them most, then a
// face, a key in the catalogue (for their books there), their years
const told = (author: CatalogueAuthor | null | undefined) =>
  author
    ? (author.bio ? 8 : 0) +
      (author.photoUrl ? 4 : 0) +
      (author.key ? 2 : 0) +
      (author.born ? 1 : 0)
    : -1;

// The writer a page is about, by `name`: the reader's books by them,
// however each writes their name (once all the shelves are in), and what's
// known of them. One book can know them poorly (the catalogue may keep a
// writer for an edition as a bare name, nothing else), so they're asked
// about by a few: the book the page was opened from, if it was, then those
// the reader has that they wrote first (none, those alcove's other readers
// have), the catalogue's first; the answer
// that tells most is theirs. Their key in the catalogue, for their books
// there: as that says, or else found by their name.
export function useWriter(name: string) {
  const { books: theirs, known } = useWriterBooks(name);
  const handed = (useLocation().state as WriterPageState | null)?.ask;
  // None of the reader's own: those alcove's other readers have
  const shared = useSharedBooksBy(name);
  const others = (shared.data ?? []).map(catalogueBook);

  const firsts = (theirs.length ? theirs : others).filter((book) =>
    sameWriter(book.authors[0] ?? '', name),
  );
  const leads = [
    ...firsts.filter((book) => book.openLibrary?.work),
    ...firsts.filter((book) => !book.openLibrary?.work),
  ].map(authorAskOf);
  const asks: AuthorAsk[] = [
    ...(handed ? [handed] : []),
    ...(!known || (!theirs.length && !settled(shared))
      ? []
      : leads.length
        ? leads
        : [{ name, title: theirs[0]?.title ?? '' }]),
  ]
    .filter(
      (ask, i, all) =>
        all.findIndex(
          (other) => other.work === ask.work && other.title === ask.title,
        ) === i,
    )
    .slice(0, ASKED);
  const answers = useQueries({ queries: asks.map(authorQuery) });
  const author =
    answers
      .map((answer) => answer.data)
      .reduce<CatalogueAuthor | null>(
        (best, each) => (told(each) > told(best) ? (each ?? null) : best),
        null,
      ) ?? null;
  // All asked, and all answered
  const heard = asks.length > 0 && answers.every(settled);

  // Not known by any book: by their name among the catalogue's writers
  const unkeyed = heard && !author?.key;
  const found = useAuthorSearch(unkeyed ? name : '');
  const names = [name, author?.name ?? ''];
  const match = found.data?.find((each) =>
    names.some((one) => one && sameWriter(each.name, one)),
  );

  return {
    theirs,
    // Their books as alcove's other readers have them
    shared,
    known,
    author,
    waiting: !heard,
    authorKey: author?.key ?? match?.key,
    // Whether there's still a key to come
    keying: !author?.key && (!heard || found.isFetching),
  };
}
