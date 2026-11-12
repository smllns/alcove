import type { ObjectId } from 'mongodb';
import { users, type Audience, type PrivacyNode, type UserDoc } from '../db.js';

// Who may open a reader's page, and who may see each part of it: everyone,
// only those who follow them, or only themselves. A reader whose page is
// to be asked for (`page: 'ask'`) is followed only once they say yes.

export type Privacy = PrivacyNode;
export const audiences = ['everyone', 'followers', 'me'] as const;
// The parts of a page that have a say of their own: what's on the
// shelves, what's being read now, the stars given, the year in reading,
// and what's written down from the books
export const parts = ['books', 'reading', 'stars', 'year', 'quotes'] as const;
export type Part = (typeof parts)[number];

// As a reader's page starts: open, all but the year (followers) and
// what's written down (the reader alone)
export const usualPrivacy: Privacy = {
  page: 'open',
  books: 'everyone',
  reading: 'everyone',
  stars: 'everyone',
  year: 'followers',
  quotes: 'me',
};

export const privacyOf = (user: Pick<UserDoc, 'privacy'>): Privacy => ({
  ...usualPrivacy,
  ...user.privacy,
});

// Who the one looking is to the reader: themselves, one of those who
// follow them, or anyone else
export type Standing = 'you' | 'follower' | 'reader';

export const seen = (audience: Audience, standing: Standing) =>
  standing === 'you' ||
  audience === 'everyone' ||
  (audience === 'followers' && standing === 'follower');

// Readers whose `part` (their books, their stars) a stranger doesn't see,
// as shown(…, 'reader') has it: their page is to be asked for, or that
// part isn't everyone's (said so, or so as usual); as a filter on users
const hiddenFromStrangers = (part: 'books' | 'stars') => ({
  $or: [
    { 'privacy.page': 'ask' },
    { [`privacy.${part}`]: { $in: ['followers', 'me'] } },
    ...(usualPrivacy[part] === 'everyone'
      ? []
      : [{ [`privacy.${part}`]: { $exists: false } }]),
  ],
});

// For what's looked up among every reader's books: only those of readers
// who let a stranger see their `part`, and none of `except`'s; as a filter
// on books
export const strangersSee = async (
  part: 'books' | 'stars',
  ...except: ObjectId[]
) => ({
  userId: {
    $nin: [
      ...except,
      ...(await users().distinct('_id', hiddenFromStrangers(part))),
    ],
  },
});

// Which parts of a page the one looking sees, and whether they see beyond
// who it is at all (a page to be asked for, they don't till they follow)
export function shown(privacy: Privacy, standing: Standing) {
  const open = privacy.page === 'open' || standing !== 'reader';
  return {
    open,
    parts: Object.fromEntries(
      parts.map((part) => [part, open && seen(privacy[part], standing)]),
    ) as Record<Part, boolean>,
  };
}
