import type { Audience, PrivacyNode, UserDoc } from '../db.js';

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

// Readers whose books a stranger doesn't see (shown(…, 'reader') has no
// books): their page is to be asked for, or their books aren't everyone's;
// as a filter on users, for what's looked up among every reader's books
export const booksHiddenFromStrangers = {
  $or: [
    { 'privacy.page': 'ask' },
    { 'privacy.books': { $in: ['followers', 'me'] } },
  ],
};

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
