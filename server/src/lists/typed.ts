import { ObjectId } from 'mongodb';
import { lists, type ListedWorkNode } from '../db.js';
import type { WantedBook } from '../books/schemas.js';
import { changeListWorks, getLists } from './repository.js';
import { TYPED } from './typedKey.js';

// Books wanted that the catalogue doesn't have, typed in by hand and kept
// in a list (typed-…): put in, changed, and taken out of every list as a
// copy of one is added to the shelves

// A book typed in as a list keeps it: what's needed to show it in a pile,
// and all that was said of it
const listed = (
  workKey: string,
  { title, authors, ...details }: WantedBook,
): ListedWorkNode => ({
  workKey,
  title,
  authors,
  coverUrl: details.cover?.url,
  firstPublishYear: details.firstPublishedYear,
  isbn: details.isbn,
  details,
});

// A book typed in put at the end of list `id`: its key, or why it wasn't
// ('missing', 'full', as changeListWorks)
export async function putTyped(userId: ObjectId, id: string, book: WantedBook) {
  const workKey = `${TYPED}${new ObjectId().toHexString()}`;
  const result = await changeListWorks(userId, id, [listed(workKey, book)], []);
  return result === 'changed' ? { workKey } : result;
}

// One typed in, changed where it is, in every list it's in: whether it
// was there
export async function changeTyped(
  userId: ObjectId,
  workKey: string,
  book: WantedBook,
) {
  const { modifiedCount } = await lists().updateOne(
    { _id: userId, 'lists.works.workKey': workKey },
    {
      $set: {
        'lists.$[].works.$[it]': listed(workKey, book),
        updatedAt: new Date(),
      },
    },
    { arrayFilters: [{ 'it.workKey': workKey }] },
  );
  return modifiedCount > 0;
}

// One typed in, now on the shelves: taken out of every list it was in;
// those lists' ids, for the copy to be in them instead
export async function takeTyped(userId: ObjectId, workKey: string) {
  const ids = (await getLists(userId))
    .filter((list) => list.works?.some((work) => work.workKey === workKey))
    .map((list) => list.id);
  if (ids.length)
    await lists().updateOne(
      { _id: userId },
      {
        $pull: { 'lists.$[].works': { workKey } },
        $set: { updatedAt: new Date() },
      },
    );
  return ids;
}
