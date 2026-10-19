import { MongoServerError, ObjectId } from 'mongodb';
import { users, type UserDoc } from '../db.js';

// What the client is allowed to see about a user
export type PublicUser = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
};

export const toPublicUser = (user: UserDoc): PublicUser => ({
  id: user._id.toHexString(),
  name: user.name,
  email: user.email,
  createdAt: user.createdAt.toISOString(),
});

export const findUserByEmail = (email: string) => users().findOne({ email });

export const findUserById = (id: ObjectId) => users().findOne({ _id: id });

// Returns null if the email is already taken
export async function createUser(input: {
  name: string;
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
    return user;
  } catch (err) {
    if (err instanceof MongoServerError && err.code === 11000) return null;
    throw err;
  }
}

// The updated user, or null if a new email is already taken
export async function updateUser(
  id: ObjectId,
  changes: Partial<Pick<UserDoc, 'name' | 'email' | 'passwordHash'>>,
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
