import { MongoServerError, ObjectId } from 'mongodb';
import { users, type UserDoc } from '../db.js';
import { HttpError } from '../lib/errors.js';

// What the client is allowed to see about a user
export type PublicUser = {
  id: string;
  // Not given (or chosen) yet: null
  name: string | null;
  username: string | null;
  email: string;
  createdAt: string;
};

export const toPublicUser = (user: UserDoc): PublicUser => ({
  id: user._id.toHexString(),
  // Cleared in settings, it's stored empty
  name: user.name || null,
  username: user.username ?? null,
  email: user.email,
  createdAt: user.createdAt.toISOString(),
});

export const findUserByEmail = (email: string) => users().findOne({ email });

export const findUserById = (id: ObjectId) => users().findOne({ _id: id });

// Which of them someone else has already, when one has
const takenOf = (err: unknown) =>
  err instanceof MongoServerError && err.code === 11000
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
    Pick<UserDoc, 'name' | 'username' | 'email' | 'passwordHash'>
  >,
) {
  try {
    return await users().findOneAndUpdate(
      { _id: id },
      { $set: changes },
      { returnDocument: 'after' },
    );
  } catch (err) {
    if (err instanceof MongoServerError && err.code === 11000) return null;
    throw err;
  }
}

export const deleteUser = (id: ObjectId) => users().deleteOne({ _id: id });

// Someone else has the username asked for; `field` says so on the field
export const usernameTaken = (field: string) =>
  new HttpError(409, 'username_taken', 'That username is taken.', {
    username: field,
  });
