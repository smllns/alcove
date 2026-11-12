// Mirrors PublicUser in server/src/auth/users.ts
export type User = {
  id: string;
  // What they'd like to be called, if they've said
  name: string | null;
  // What others find them by (@name); readers from before usernames may
  // not have chosen one yet
  username: string | null;
  email: string;
  createdAt: string;
  // A line or two about themselves, and who sees what of their page
  about: string | null;
  privacy: Privacy;
  // Their photo, if they've uploaded one
  avatarUrl: string | null;
  // Their favourite books, by id, first to last
  favourites: string[];
  // One of those who run alcove (writes its news)
  admin: boolean;
};

// Who may see a part of a reader's page. Mirrors users/privacy.ts.
export type Audience = 'everyone' | 'followers' | 'me';
// The parts of a page with a say of their own
export type PagePart = 'books' | 'reading' | 'stars' | 'year' | 'quotes';
// Who may open the page at all (`ask`: only those let in), and who may see
// each part
export type Privacy = { page: 'open' | 'ask' } & Record<PagePart, Audience>;

// A username as it's shown, and found: @name
export const handle = (username: string) => `@${username}`;

// What to call a reader (this one, or another): their name, or else their
// @username
export const callName = (user: Pick<User, 'name' | 'username'> | null) =>
  user?.name ?? (user?.username ? handle(user.username) : '');

// Another reader, as far as anyone may see them. Mirrors Reader in
// server/src/users/repository.ts.
export type Reader = {
  username: string;
  name: string | null;
  avatarUrl: string | null;
  // The one looking
  you: boolean;
};
