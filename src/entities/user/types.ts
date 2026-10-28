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
};

// A username as it's shown, and found: @name
export const handle = (username: string) => `@${username}`;

// What to call a reader: their name, or else their @username
export const callName = (user: User | null) =>
  user?.name ?? (user?.username ? handle(user.username) : '');

// Another reader, as far as anyone may see them. Mirrors Reader in
// server/src/users/repository.ts.
export type Reader = {
  username: string;
  name: string | null;
  // The one looking
  you: boolean;
};
