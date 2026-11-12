import type { Filter, ObjectId } from 'mongodb';
import { wantedBookSchema } from '../books/schemas.js';
import { asShelved, shelvedProjection } from '../books/shelvedWork.js';
import { books, type BookDoc } from '../db.js';
import { escapedForRegex, titleKey } from '../lib/text.js';
import { strangersSee } from './privacy.js';

// A writer's books as alcove's readers have them, for a writer the
// catalogue knows little or nothing of: found by the last word of their
// name among every reader's books but the one asking's, of readers who let
// anyone see their books; each book once (by its title), told as the
// catalogue would tell it, nothing of anyone's copy nor whose it is. The
// one asking tells the writer from another of that surname.

// How many books are looked through at most, and how many a search finds
const LOOKED = 400;
const MOST = 5;

// What's said of a book itself, as a book wanted has it, and all that's
// read of a book to tell it (never its copy)
const BOOK_FIELDS = Object.keys(wantedBookSchema.shape);
const projection = {
  ...shelvedProjection,
  subtitle: 1,
  ...Object.fromEntries(BOOK_FIELDS.map((field) => [field, 1])),
};

// A reader's book as any reader may see it: what the catalogue would say
// of it, and all that's said of the book itself on their shelves
// (description, publisher, pages, …), nothing of their copy
export function sharedWork(book: BookDoc) {
  const details = Object.fromEntries(
    BOOK_FIELDS.flatMap((field) => {
      const value = book[field as keyof BookDoc];
      return value === undefined ? [] : [[field, value]];
    }),
  );
  return { ...asShelved(book), subtitle: book.subtitle, details };
}

// Every reader's books but `me`'s that `filter` finds, of readers who let
// anyone see their books (strangersSee); each once (by its
// title), the one the catalogue knows, or with a cover, first
async function sharedBooks(filter: Filter<BookDoc>, me: ObjectId) {
  const found = await books()
    .find(
      { ...filter, ...(await strangersSee('books', me)) },
      { projection, limit: LOOKED },
    )
    .toArray();
  const ranked = found.toSorted(
    (a, b) =>
      Number(Boolean(b.openLibrary?.work)) -
        Number(Boolean(a.openLibrary?.work)) ||
      Number(Boolean(b.cover)) - Number(Boolean(a.cover)),
  );
  const seen = new Set<string>();
  return ranked.filter((book) => {
    const key = titleKey(book.title);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// Books with a writer of `name`'s last name (of two letters or more), as a
// filter; null for a name without one
export function bySurname(name: string) {
  const surname = name.trim().split(/\s+/).at(-1);
  if (!surname || surname.length < 2) return null;
  return { authors: { $regex: escapedForRegex(surname), $options: 'i' } };
}

export async function sharedBooksBy(name: string, me: ObjectId) {
  const surname = bySurname(name);
  return surname ? (await sharedBooks(surname, me)).map(sharedWork) : [];
}

// Readers' own books the catalogue doesn't know whose title or writer has
// `query` in it, for a search, each with all that's said of it
export async function sharedBooksMatching(query: string, me: ObjectId) {
  const regex = { $regex: escapedForRegex(query.trim()), $options: 'i' };
  const found = await sharedBooks(
    {
      'openLibrary.work': { $exists: false },
      $or: [{ title: regex }, { authors: regex }],
    },
    me,
  );
  return found.slice(0, MOST).map(sharedWork);
}

// What alcove's readers have of a work the catalogue may say nothing of:
// what it's about as one wrote it on their copy, and the cover one gave
// theirs; each the latest, of readers who let anyone see their books, or
// null
export async function sharedAbout(workKey: string) {
  const seen = await strangersSee('books');
  const latest = (field: 'description' | 'cover.url') =>
    books().findOne(
      {
        'openLibrary.work': workKey,
        [field]: { $type: 'string', $ne: '' },
        ...seen,
      },
      { projection: { description: 1, cover: 1 }, sort: { updatedAt: -1 } },
    );
  const [described, covered] = await Promise.all([
    latest('description'),
    latest('cover.url'),
  ]);
  return {
    description: described?.description ?? null,
    cover: covered?.cover ?? null,
  };
}
