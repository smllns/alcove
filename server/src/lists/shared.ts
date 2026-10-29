import type { ObjectId } from 'mongodb';
import {
  books,
  lists,
  users,
  type BookListNode,
  type ListedWorkNode,
  type UserDoc,
} from '../db.js';
import { escapedForRegex } from '../lib/text.js';
import { countByList } from './repository.js';

// Lists other readers have made public: found by their names, and opened,
// never changed. Only what any reader may see of them goes out: the
// list's name, whose it is, and its books as the catalogue tells them.

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
  const owners = await users()
    .find({ _id: { $in: rows.map((row) => row._id) } }, ownerProjection)
    .toArray();
  return Promise.all(
    rows.map(async ({ _id, list }): Promise<SharedList> => ({
      id: list.id,
      name: list.name,
      owner: calledBy(owners.find((owner) => owner._id.equals(_id))),
      books: (await countByList(_id, [list]))[list.id] ?? 0,
    })),
  );
}

// A book in a public list as any reader may see it: what the catalogue
// would say of it, nothing of the owner's copy. One not from the
// catalogue is told apart by a key of its own (`book-`), opening nothing.
const asWork = (work: ListedWorkNode) => ({ ...work, editionCount: 0 });

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
  const [owner, copies] = await Promise.all([
    users().findOne({ _id: doc._id }, ownerProjection),
    books()
      .find(
        { userId: doc._id, lists: id },
        {
          projection: {
            title: 1,
            authors: 1,
            firstPublishedYear: 1,
            cover: 1,
            openLibrary: 1,
          },
          sort: { createdAt: -1 },
        },
      )
      .toArray(),
  ]);
  const shelved = copies.map((book) =>
    asWork({
      workKey: book.openLibrary?.work ?? `book-${book._id.toHexString()}`,
      title: book.title,
      authors: book.authors,
      coverUrl: book.cover?.url,
      firstPublishYear: book.firstPublishedYear,
    }),
  );
  const keys = new Set(shelved.map((work) => work.workKey));
  const works = (list.works ?? [])
    .filter((work) => !keys.has(work.workKey))
    .map(asWork);
  return {
    id: list.id,
    name: list.name,
    owner: calledBy(owner),
    works: [...shelved, ...works],
  };
}
