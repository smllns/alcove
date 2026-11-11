import type { ObjectId } from 'mongodb';
import { users, type UserDoc } from '../db.js';
import { escapedForRegex } from '../lib/text.js';

// What any reader may see of another: how they're found and called, read
// off them so
export const listed = {
  projection: { username: 1, name: 1, avatarUrl: 1 },
} as const;
export const asReader = (
  user: Pick<UserDoc, 'username' | 'name' | 'avatarUrl'>,
) => ({
  username: user.username!,
  name: user.name || null,
  avatarUrl: user.avatarUrl || null,
});

// A reader found, and whether it's the one searching
export type Reader = ReturnType<typeof asReader> & { you: boolean };

const MOST = 8;

// Readers whose username starts with `query`, found by its index; then, if
// there's room for more, those whose name has it in it. Only readers with a
// username, as that's how they're found.
export async function searchReaders(query: string, me: ObjectId) {
  const plain = query.replace(/^@/, '').trim();
  if (!plain) return [];
  const byHandle = await users()
    .find(
      { username: { $regex: `^${escapedForRegex(plain.toLowerCase())}` } },
      { ...listed, limit: MOST },
    )
    .toArray();
  const byName =
    byHandle.length < MOST
      ? await users()
          .find(
            {
              username: { $type: 'string' },
              name: { $regex: escapedForRegex(plain), $options: 'i' },
              _id: { $nin: byHandle.map((user) => user._id) },
            },
            { ...listed, limit: MOST - byHandle.length },
          )
          .toArray()
      : [];
  const found = [...byHandle, ...byName];
  return found.map((user): Reader => ({
    ...asReader(user),
    you: user._id.equals(me),
  }));
}
