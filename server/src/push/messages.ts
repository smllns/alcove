import { books, users, type ActivityDoc } from '../db.js';
import { pushOn, pushTo, type Message } from './send.js';

// What readers are told on their devices: what was done for them alone (a
// heart on their review, a follow, an ask to follow), as their feed tells
// it, and alcove's own news. Each opens where the app has it (the
// addresses as src/shared/config/paths.ts has them).

type Done = Omit<ActivityDoc, '_id' | 'createdAt'>;

export async function tellDone(event: Done) {
  if (!pushOn || !event.target) return;
  const [who, book] = await Promise.all([
    users().findOne(
      { _id: event.userId },
      { projection: { name: 1, username: 1 } },
    ),
    event.book &&
      books().findOne({ _id: event.book }, { projection: { title: 1 } }),
  ]);
  if (!who?.username) return;
  const name = who.name || `@${who.username}`;
  const told: Partial<Record<Done['kind'], Message | null>> = {
    liked: book && {
      title: `${name} liked your review`,
      body: book.title,
      url: `/library/books/${book._id.toHexString()}`,
    },
    followed: {
      title: `${name} started following you`,
      url: `/library/readers/${who.username}`,
    },
    asked: {
      title: `${name} requested to follow you`,
      body: 'Accept or decline on your page.',
      url: '/library/profile',
    },
  };
  const message = told[event.kind];
  if (message)
    await pushTo(
      { userId: event.target },
      { ...message, tag: `${event.kind}-${event.userId.toHexString()}` },
    );
}

// A piece of news, just written, to everyone's devices
export const tellNews = (news: {
  id: string;
  title: string;
  body: string;
  link?: { to: string };
}) =>
  pushTo(
    {},
    {
      title: news.title,
      body: news.body,
      url: news.link?.to ?? '/library',
      tag: `news-${news.id}`,
    },
  );
