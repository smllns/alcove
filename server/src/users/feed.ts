import type { ObjectId } from 'mongodb';
import { workKeyOf } from '../books/shelvedWork.js';
import { activity, books, follows, type ActivityDoc } from '../db.js';
import { privacyOf, shown } from './privacy.js';
import { seenBook } from './profile.js';
import { latestNews } from '../news/repository.js';
import { asReader, readersByIds } from './repository.js';

// A reader's feed: what the readers they follow did with their books since
// they began following them (each only as far as a follower may see it),
// and what was done for them alone (a heart on their review, a follow, an
// ask to follow), with alcove's own news among them; the latest first,
// with how many came since they last looked

// The most in a feed
const MOST = 60;
// How much of a review a feed shows
const SNIPPET = 280;

// What those followed do with their books that comes to the feed, each
// seen only as far as their page shows the book to a follower (seenBook):
// the book at all, and for a start or a finish, that too
const theirKinds: ActivityDoc['kind'][] = [
  'added',
  'started',
  'finished',
  'reviewed',
];
const shows = (kind: ActivityDoc['kind'], seen: ReturnType<typeof seenBook>) =>
  kind === 'started'
    ? Boolean(seen?.reading)
    : kind === 'finished'
      ? seen?.reading === 'read'
      : Boolean(seen);

export async function feedOf(me: ObjectId, seenAt?: Date) {
  const [items, news] = await Promise.all([activityFor(me), latestNews()]);
  const told = news.map((each) => ({
    id: `news-${each.id}`,
    kind: 'news' as const,
    at: each.at,
    news: each,
  }));
  const all = [...items, ...told].toSorted((a, b) => b.at.localeCompare(a.at));
  const unread = all.filter(
    (each) => !seenAt || new Date(each.at) > seenAt,
  ).length;
  return { items: all, unread };
}

// What's in `me`'s feed but the news
async function activityFor(me: ObjectId) {
  // Those followed, each since they were
  const followed = await follows()
    .find(
      { follower: me, state: 'following' },
      { projection: { followee: 1, createdAt: 1 } },
    )
    .toArray();
  const events = await activity()
    .find(
      {
        $or: [
          ...followed.map((each) => ({
            userId: each.followee,
            kind: { $in: theirKinds },
            createdAt: { $gte: each.createdAt },
          })),
          { target: me },
        ],
      },
      { sort: { createdAt: -1 }, limit: MOST },
    )
    .toArray();
  const [{ byId: personOf }, copies] = await Promise.all([
    readersByIds(
      events.map((each) => each.userId),
      { privacy: 1 },
    ),
    books()
      .find(
        { _id: { $in: events.flatMap((each) => each.book ?? []) } },
        {
          projection: {
            title: 1,
            authors: 1,
            cover: 1,
            openLibrary: 1,
            createdAt: 1,
            'copy.reading': 1,
            'copy.finished': 1,
            'copy.rating': 1,
            'copy.review': 1,
          },
        },
      )
      .toArray(),
  ]);
  // What a follower sees of each of them
  const partsOf = new Map(
    [...personOf].map(([id, person]) => [
      id,
      shown(privacyOf(person), 'follower').parts,
    ]),
  );
  const bookOf = new Map(copies.map((each) => [each._id.toHexString(), each]));

  return events.flatMap((event) => {
    const person = personOf.get(event.userId.toHexString());
    const parts = partsOf.get(event.userId.toHexString());
    if (!person || !parts) return [];
    const copy = event.book && bookOf.get(event.book.toHexString());
    if (event.book && !copy) return [];
    // One of their own books, seen as a follower sees it on their page
    const seen = copy && !event.target ? seenBook(copy, parts) : null;
    if (copy && !event.target && !shows(event.kind, seen)) return [];
    return [
      {
        id: event._id.toHexString(),
        kind: event.kind,
        at: event.createdAt.toISOString(),
        // Done for the one looking, not by one they follow
        forYou: Boolean(event.target),
        reader: asReader(person),
        ...(copy && {
          book: {
            id: copy._id.toHexString(),
            workKey: workKeyOf(copy),
            title: copy.title,
            authors: copy.authors,
            coverUrl: copy.cover?.url,
            ...(event.kind === 'finished' &&
              seen?.rating && { rating: seen.rating }),
            ...(event.kind === 'reviewed' &&
              copy.copy?.review && {
                review: copy.copy.review.slice(0, SNIPPET),
              }),
          },
        }),
      },
    ];
  });
}
