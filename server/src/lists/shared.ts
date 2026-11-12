import type { ObjectId } from 'mongodb';
import { asShelved, shelvedProjection } from '../books/shelvedWork.js';
import {
  books,
  lists,
  users,
  type BookListNode,
  type ListedWorkNode,
  type UserDoc,
} from '../db.js';
import { escapedForRegex } from '../lib/text.js';
import { countByList, countsByOwner } from './counts.js';

// Lists other readers have made public: found by their names, and opened,
// never changed. Only what any reader may see of them goes out: the
// list's name and what's said of it, whose it is, and its books as the catalogue tells them.

// The most found at once
const MOST = 12;

// A public list found: whose it is (as they're called), and how many
// books are in it
export type SharedList = {
  id: string;
  name: string;
  owner: string;
  books: number;
};

type Owner = Pick<UserDoc, '_id' | 'name' | 'username'>;
const ownerProjection = { projection: { name: 1, username: 1 } } as const;

// As another reader sees them called: by their name, or their username
const calledBy = (owner: Owner | null | undefined) =>
  owner?.name || (owner?.username ? `@${owner.username}` : 'A reader');

// Other readers' public lists with `query` in their names
export async function searchSharedLists(query: string, me: ObjectId) {
  const named = { $regex: escapedForRegex(query), $options: 'i' };
  const rows = await lists()
    .aggregate<{ _id: ObjectId; list: BookListNode }>([
      {
        $match: {
          _id: { $ne: me },
          lists: { $elemMatch: { public: true, name: named } },
        },
      },
      { $unwind: '$lists' },
      { $match: { 'lists.public': true, 'lists.name': named } },
      { $limit: MOST },
      { $project: { list: '$lists' } },
    ])
    .toArray();
  const [owners, counts] = await Promise.all([
    users()
      .find({ _id: { $in: rows.map((row) => row._id) } }, ownerProjection)
      .toArray(),
    countsByOwner(rows.map((row) => ({ userId: row._id, lists: [row.list] }))),
  ]);
  return rows.map(({ _id, list }): SharedList => ({
    id: list.id,
    name: list.name,
    owner: calledBy(owners.find((owner) => owner._id.equals(_id))),
    books: counts.get(_id.toHexString())?.[list.id] ?? 0,
  }));
}

// A book in a public list as any reader may see it: what the catalogue
// would say of it, nothing of the owner's copy. One not from the
// catalogue is told apart by a key of its own (`book-`), opening what's
// known of it here.
const asWork = (work: ListedWorkNode) => ({ ...work, editionCount: 0 });

// A list's books: those on its owner's shelves in it, newest first (the
// first `most` of them, if that's given), then those from the catalogue in
// it that aren't among them
async function listWorks(userId: ObjectId, list: BookListNode, most?: number) {
  const copies = await books()
    .find(
      { userId, lists: list.id },
      {
        projection: shelvedProjection,
        sort: { createdAt: -1 },
        ...(most && { limit: most }),
      },
    )
    .toArray();
  const shelved = copies.map(asShelved);
  const keys = new Set(shelved.map((work) => work.workKey));
  const works = (list.works ?? [])
    .filter((work) => !keys.has(work.workKey))
    .map(asWork);
  return [...shelved, ...works];
}

// One public list, with its books: those on its owner's shelves in it,
// newest first, then those from the catalogue in it; or null when there's
// no such list or it isn't public
export async function sharedList(id: string) {
  const doc = await lists().findOne(
    { lists: { $elemMatch: { id, public: true } } },
    { projection: { 'lists.$': 1 } },
  );
  const list = doc?.lists[0];
  if (!doc || !list) return null;
  const [owner, works] = await Promise.all([
    users().findOne({ _id: doc._id }, ownerProjection),
    listWorks(doc._id, list),
  ]);
  return {
    id: list.id,
    name: list.name,
    description: list.description,
    owner: calledBy(owner),
    works,
  };
}

// The most books of a list drawn in its pile
const PILE = 16;

// A reader's public lists, for their page: each with how many books it
// holds and the first of them for its pile (the newest on the shelves
// first, then those from the catalogue), as a list kept from another
// reader is (SavedListNode)
export async function publicListsOf(userId: ObjectId) {
  const doc = await lists().findOne({ _id: userId });
  const open = (doc?.lists ?? []).filter((list) => list.public);
  if (!open.length) return [];
  const counts = await countByList(userId, open);
  return Promise.all(
    open.map(async (list) => ({
      kind: 'shared' as const,
      ref: list.id,
      name: list.name,
      books: counts[list.id] ?? 0,
      works: (await listWorks(userId, list, PILE)).slice(0, PILE),
    })),
  );
}
