import type { ObjectId } from 'mongodb';
import { books } from '../db.js';
import { escapedForRegex } from '../lib/text.js';
import { privacyOf, shown, strangersSee } from './privacy.js';
import { asReader, readersByIds } from './repository.js';
import { likesOf } from './reviewLikes.js';
import { bySurname } from './sharedBooks.js';

// What other readers wrote of a book, for its page: the review each kept
// on their copy, with who wrote it and when, and their stars where they let
// anyone see their stars, and its hearts (and whether the one asking gave
// one); the most liked first, then the latest. The book found by its work in
// the catalogue, or (one it doesn't know) by its title and its writer's
// last name. Only from readers whose books anyone may see, and never the
// one asking's own.

// The most brought at once
const MOST = 60;

export async function readersReviews(
  book: { work?: string; title: string; author?: string },
  me: ObjectId,
) {
  const named = book.title.trim() && {
    title: { $regex: `^${escapedForRegex(book.title.trim())}$`, $options: 'i' },
    ...(book.author && bySurname(book.author)),
  };
  const same = [
    ...(book.work ? [{ 'openLibrary.work': book.work }] : []),
    ...(named ? [named] : []),
  ];
  if (!same.length) return [];
  const found = await books()
    .find(
      {
        $or: same,
        'copy.review': { $type: 'string', $ne: '' },
        ...(await strangersSee('books', me)),
      },
      {
        projection: {
          userId: 1,
          updatedAt: 1,
          'copy.review': 1,
          'copy.rating': 1,
        },
        sort: { updatedAt: -1 },
        limit: MOST,
      },
    )
    .toArray();
  const [{ byId }, hearts] = await Promise.all([
    readersByIds(
      found.map((each) => each.userId),
      { privacy: 1 },
    ),
    likesOf(
      found.map((each) => each._id),
      me,
    ),
  ]);
  // Each reader once, by their latest
  const seen = new Set<string>();
  const reviews = found.flatMap((each) => {
    const id = each.userId.toHexString();
    const writer = byId.get(id);
    if (!writer || seen.has(id)) return [];
    seen.add(id);
    const stars = shown(privacyOf(writer), 'reader').parts.stars;
    const liked = hearts.get(each._id.toHexString());
    return [
      {
        id: each._id.toHexString(),
        reader: asReader(writer),
        likes: liked?.likes ?? 0,
        liked: liked?.liked ?? false,
        review: each.copy!.review!,
        ...(stars && each.copy?.rating && { rating: each.copy.rating }),
        at: each.updatedAt.toISOString(),
      },
    ];
  });
  // The most liked first; among those liked alike, the latest
  return reviews.toSorted((a, b) => b.likes - a.likes);
}
