import { ObjectId } from 'mongodb';
import { users, type UserDoc } from '../db.js';
import { HttpError, isDuplicateKey } from '../lib/errors.js';
import { isAdmin } from '../news/repository.js';
import { privacyOf, type Privacy } from '../users/privacy.js';

// What the client is allowed to see about a user
export type PublicUser = {
  id: string;
  // Not given (or chosen) yet: null
  name: string | null;
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

export const toPublicUser = (user: UserDoc): PublicUser => ({
  id: user._id.toHexString(),
  // Cleared in settings, it's stored empty
  name: user.name || null,
  username: user.username ?? null,
  email: user.email,
  createdAt: user.createdAt.toISOString(),
  about: user.about || null,
  privacy: privacyOf(user),
  avatarUrl: user.avatarUrl || null,
  favourites: (user.favourites ?? []).map((id) => id.toHexString()),
  admin: isAdmin(user),
});

export const findUserByEmail = (email: string) => users().findOne({ email });

export const findUserById = (id: ObjectId) => users().findOne({ _id: id });

// Which of them someone else has already, when one has
const takenOf = (err: unknown) =>
  isDuplicateKey(err)
    ? err.keyPattern?.username
      ? ('username' as const)
      : ('email' as const)
    : null;

// The new user, or which of its email and username is already taken
export async function createUser(input: {
  username: string;
  email: string;
  passwordHash: string;
}) {
  const user: UserDoc = {
    _id: new ObjectId(),
    ...input,
    createdAt: new Date(),
  };
  try {
    await users().insertOne(user);
    return { user };
  } catch (err) {
    const taken = takenOf(err);
    if (taken) return { taken };
    throw err;
  }
}

// The updated user, or null if a new email or username is already taken
export async function updateUser(
  id: ObjectId,
  changes: Partial<
    Pick<
      UserDoc,
      | 'name'
      | 'username'
      | 'email'
      | 'passwordHash'
      | 'about'
      | 'privacy'
      | 'avatarUrl'
      | 'favourites'
    >
  >,
) {
  try {
    return await users().findOneAndUpdate(
      { _id: id },
      { $set: changes },
      { returnDocument: 'after' },
    );
  } catch (err) {
    if (isDuplicateKey(err)) return null;
    throw err;
  }
}

export const deleteUser = (id: ObjectId) => users().deleteOne({ _id: id });

// Someone else has the username asked for; `field` says so on the field
export const usernameTaken = (field: string) =>
  new HttpError(409, 'username_taken', 'That username is taken.', {
    username: field,
  });
