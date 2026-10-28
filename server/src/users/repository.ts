import type { ObjectId } from 'mongodb';
import { users, type UserDoc } from '../db.js';
import { escapedForRegex } from '../lib/text.js';

// What any reader may see of another: how they're found and called
export type Reader = {
  username: string;
  name: string | null;
  // The one searching
  you: boolean;
};

const shown = { projection: { username: 1, name: 1 } } as const;
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
      { ...shown, limit: MOST },
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
            { ...shown, limit: MOST - byHandle.length },
          )
          .toArray()
      : [];
  const found = [...byHandle, ...byName];
  return found.map(
    (user: Pick<UserDoc, '_id' | 'username' | 'name'>): Reader => ({
      username: user.username!,
      name: user.name || null,
      you: user._id.equals(me),
    }),
  );
}
