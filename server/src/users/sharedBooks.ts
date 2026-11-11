import type { Filter, ObjectId } from 'mongodb';
import { wantedBookSchema } from '../books/schemas.js';
import { asShelved, shelvedProjection } from '../books/shelvedWork.js';
import { books, users, type BookDoc } from '../db.js';
import { escapedForRegex, titleKey } from '../lib/text.js';
import { booksHiddenFromStrangers } from './privacy.js';

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
// anyone see their books (booksHiddenFromStrangers); each once (by its
// title), the one the catalogue knows, or with a cover, first
async function sharedBooks(filter: Filter<BookDoc>, me: ObjectId) {
  const hidden = await users().distinct('_id', booksHiddenFromStrangers);
  const found = await books()
    .find(
      { ...filter, userId: { $nin: [me, ...hidden] } },
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

export async function sharedBooksBy(name: string, me: ObjectId) {
  const surname = name.trim().split(/\s+/).at(-1);
  if (!surname || surname.length < 2) return [];
  const regex = { $regex: escapedForRegex(surname), $options: 'i' };
  return (await sharedBooks({ authors: regex }, me)).map(sharedWork);
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
