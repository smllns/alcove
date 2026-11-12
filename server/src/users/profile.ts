import type { ObjectId } from 'mongodb';
import { workKeyOf } from '../books/shelvedWork.js';
import { books, type BookDoc, type UserDoc } from '../db.js';
import { publicListsOf } from '../lists/shared.js';
import { askingCount, followCounts, followState } from './follows.js';
import { privacyOf, shown, type Part, type Standing } from './privacy.js';
import { asReader } from './repository.js';

// A reader's page as another reader (or they themselves) may see it: who
// they are, how they stand to the one looking, how many follow them and
// they follow, and of their books only what the one looking may see of
// them: every book, if their books are seen; otherwise only those being
// read now, and those read this year, as far as those parts are seen.
// Each book with only the parts of it that are seen.

// A book of theirs as it may be seen. Mirrors ReaderBook on the client.
export type ReaderBook = {
  id: string;
  // Its work in the catalogue; one the catalogue doesn't know, book-…
  workKey: string;
  title: string;
  authors: string[];
  coverUrl?: string;
  firstPublishedYear?: number;
  pages?: number;
  // When it came to their shelves
  addedAt: string;
  rating?: number;
  reading?: 'reading' | 'read';
  started?: string;
  finished?: string;
  quotes?: string[];
};

const projection = {
  title: 1,
  authors: 1,
  firstPublishedYear: 1,
  cover: 1,
  openLibrary: 1,
  pages: 1,
  createdAt: 1,
  'copy.reading': 1,
  'copy.started': 1,
  'copy.finished': 1,
  'copy.rating': 1,
  'copy.quotes': 1,
} as const;

// A book as `sees` lets it be seen (the year in reading being this one,
// unless `year` says), or null when nothing of it is
export function seenBook(
  book: BookDoc,
  sees: Record<Part, boolean>,
  year = String(new Date().getFullYear()),
) {
  const copy = book.copy;
  const reading = sees.reading && copy?.reading === 'reading';
  const read = sees.year && copy?.reading === 'read';
  const thisYear = read && Boolean(copy?.finished?.startsWith(year));
  if (!sees.books && !reading && !thisYear) return null;
  const seen: ReaderBook = {
    id: book._id.toHexString(),
    workKey: workKeyOf(book),
    title: book.title,
    authors: book.authors,
    coverUrl: book.cover?.url,
    firstPublishedYear: book.firstPublishedYear,
    pages: book.pages,
    addedAt: book.createdAt.toISOString(),
  };
  if (sees.stars && copy?.rating) seen.rating = copy.rating;
  if (reading)
    Object.assign(seen, { reading: 'reading', started: copy?.started });
  // Read, when it was begun too, for how long it took (start to finish)
  if (read)
    Object.assign(seen, {
      reading: 'read',
      started: copy?.started,
      finished: copy?.finished,
    });
  if (sees.quotes && copy?.quotes?.length) seen.quotes = copy.quotes;
  return seen;
}

// What `viewer` sees of `owner`: whether they follow them (or ask to), so
// who they are to them, and so whether they see beyond who it is (`open`)
// and which parts of their page (shown)
export async function sightOf(owner: UserDoc, viewer: ObjectId) {
  const you = owner._id.equals(viewer);
  const state = you ? 'none' : await followState(viewer, owner._id);
  const standing: Standing = you
    ? 'you'
    : state === 'following'
      ? 'follower'
      : 'reader';
  return { state, standing, ...shown(privacyOf(owner), standing) };
}

// A reader's favourite books among `all` of theirs, in their order; one
// since gone, left out
function favouritesOf(
  owner: UserDoc,
  all: BookDoc[],
  parts: Record<Part, boolean>,
) {
  const byId = new Map(all.map((book) => [book._id.toHexString(), book]));
  return (owner.favourites ?? []).flatMap((id) => {
    const book = byId.get(id.toHexString());
    return (book && seenBook(book, parts)) ?? [];
  });
}

export async function readerPage(owner: UserDoc, viewer: ObjectId) {
  const you = owner._id.equals(viewer);
  const [{ state, open, parts }, back, counts, asking] = await Promise.all([
    sightOf(owner, viewer),
    you ? 'none' : followState(owner._id, viewer),
    followCounts(owner._id),
    you ? askingCount(owner._id) : 0,
  ]);
  const [all, lists] = await Promise.all([
    open
      ? books()
          .find({ userId: owner._id }, { projection, sort: { createdAt: -1 } })
          .toArray()
      : [],
    open ? publicListsOf(owner._id) : [],
  ]);
  return {
    ...asReader(owner),
    about: owner.about || null,
    you,
    follow: state,
    followsYou: back === 'following',
    counts: {
      ...counts,
      books: parts.books ? all.length : null,
    },
    open,
    shows: parts,
    // Only to the reader themself: who sees each part, and how many ask
    // to follow them
    ...(you && { privacy: privacyOf(owner), asking }),
    books: all.flatMap((book) => seenBook(book, parts) ?? []),
    // The four they'd most have seen, first to last, as their books are
    favourites: parts.books ? favouritesOf(owner, all, parts) : [],
    lists,
  };
}
