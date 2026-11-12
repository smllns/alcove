import type { ObjectId } from 'mongodb';
import { books, type BookDoc } from '../db.js';
import { sameButCase } from '../lib/text.js';
import { forgetBooks, newBookDoc, storedCoversWhere } from './repository.js';
import type { BookInput } from './schemas.js';

// Many books at once: brought over together, told apart from those on the
// shelves together, taken off together

// Books brought over together, each added as addBook adds one, in one go,
// a moment apart so they keep the order they came in
export async function addBooks(
  userId: ObjectId,
  inputs: BookInput[],
  importId?: string,
) {
  if (!inputs.length) return;
  const now = Date.now();
  await books().insertMany(
    inputs.map((input, i): BookDoc => {
      return {
        ...newBookDoc(userId, input, new Date(now + i)),
        ...(importId && { importId }),
      };
    }),
  );
}

// What tells two books apart as findSameBook does: the title and first
// writer (as one, but for capitals), the catalogue's work, the ISBN
type Likeness = {
  title: string;
  author?: string;
  work?: string;
  isbn?: string;
};
const likenessOf = (book: {
  title: string;
  authors?: string[];
  isbn?: string;
  openLibrary?: { work?: string };
}): Likeness => ({
  title: book.title,
  author: book.authors?.[0],
  work: book.openLibrary?.work,
  isbn: book.isbn,
});
const alike = (there: Likeness, book: Likeness) =>
  (sameButCase(there.title, book.title) &&
    (!book.author || sameButCase(there.author ?? '', book.author))) ||
  (!!book.work && there.work === book.work) ||
  (!!book.isbn && there.isbn === book.isbn);

// For each of `inputs`, whether it's the same as a book on the shelves, or
// one before it among them (as findSameBook tells), all asked in one go
export async function sameBooks(userId: ObjectId, inputs: BookInput[]) {
  const works = inputs.flatMap((input) => input.openLibrary?.work ?? []);
  const isbns = inputs.flatMap((input) => input.isbn ?? []);
  const there = inputs.length
    ? await books()
        .find(
          {
            userId,
            $or: [
              { title: { $in: inputs.map((input) => input.title) } },
              ...(works.length ? [{ 'openLibrary.work': { $in: works } }] : []),
              ...(isbns.length ? [{ isbn: { $in: isbns } }] : []),
            ],
          },
          {
            projection: { title: 1, authors: 1, isbn: 1, openLibrary: 1 },
            collation: { locale: 'en', strength: 2 },
          },
        )
        .toArray()
    : [];
  const seen = there.map(likenessOf);
  return inputs.map((input) => {
    const book = likenessOf(input);
    if (seen.some((each) => alike(each, book))) return true;
    seen.push(book);
    return false;
  });
}

// Books taken off the shelves together (all of them, or one import's):
// how many went, and the photos of their covers the reader uploaded, to
// be thrown away with them; all said of them in the feeds gone too
export async function deleteBooksWhere(
  userId: ObjectId,
  where: { importId?: string } = {},
) {
  const filter = { userId, ...where };
  const [covers, ids] = await Promise.all([
    storedCoversWhere(filter),
    books().distinct('_id', filter),
  ]);
  const { deletedCount } = await books().deleteMany(filter);
  await forgetBooks(ids);
  return { deleted: deletedCount, covers };
}

// The reader's latest import from another site, if any: which, when, and
// how many of its books are still on the shelves
export async function lastImport(userId: ObjectId) {
  const [latest] = await books()
    .find({ userId, importId: { $exists: true } })
    .sort({ createdAt: -1 })
    .limit(1)
    .project<{ importId: string; createdAt: Date }>({
      importId: 1,
      createdAt: 1,
    })
    .toArray();
  if (!latest) return null;
  return {
    id: latest.importId,
    at: latest.createdAt.toISOString(),
    books: await books().countDocuments({ userId, importId: latest.importId }),
  };
}
