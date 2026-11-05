import { ObjectId } from 'mongodb';
import { books, lists, type ListedWorkNode } from '../db.js';
import { begun } from '../books/copy.js';
import { sameButCase } from '../lib/text.js';
import { changeListWorks, getLists, WANT_LIST } from './repository.js';
import { TYPED } from './schemas.js';

// Want to read, the list every reader has (WANT_LIST): books coming into
// it from another site, going out of it as they're added or an import's
// undone

// A book from the catalogue wanted, taken out of Want to read as the
// reader adds a copy of it: whether it was there
export async function takeWanted(userId: ObjectId, workKey: string) {
  const { modifiedCount } = await lists().updateOne(
    {
      _id: userId,
      lists: { $elemMatch: { id: WANT_LIST, 'works.workKey': workKey } },
    },
    { $pull: { 'lists.$.works': { workKey } } },
  );
  return modifiedCount > 0;
}

// Books the reader wants to read, put in Want to read together, each as
// the catalogue knows it (`work`) or, not known to it, as it came: their
// own copy of one, if they have it (by its work) and haven't begun it,
// marked so; else the catalogue's in the list itself, or one not known
// under a key of its own (typed-…). None put in twice: a work there
// already, or one not known by the same title and first writer, stays as
// it is. Asked and changed in one go. How many went in, and how many as
// they came.
export async function wantAll(
  userId: ObjectId,
  items: {
    entry: { title: string; authors: string[]; isbn?: string };
    work: ListedWorkNode | null;
  }[],
  importId: string,
) {
  const list = (await getLists(userId)).find((each) => each.id === WANT_LIST);
  const keys = items.flatMap(({ work }) => (work ? [work.workKey] : []));
  const copies = keys.length
    ? await books()
        .find(
          { userId, 'openLibrary.work': { $in: keys } },
          { projection: { openLibrary: 1, 'copy.reading': 1 } },
        )
        .toArray()
    : [];
  const copyOf = new Map(copies.map((copy) => [copy.openLibrary?.work, copy]));
  const listed = [...(list?.works ?? [])];
  const marked: ObjectId[] = [];
  const counts = { added: 0, unfound: 0 };
  for (const { entry, work } of items) {
    const copy = work && copyOf.get(work.workKey);
    if (copy) {
      if (begun(copy.copy?.reading)) continue;
      marked.push(copy._id);
    } else if (work) {
      if (!listed.some((each) => each.workKey === work.workKey))
        listed.push({ ...work, importId });
    } else {
      counts.unfound++;
      const known = listed.some(
        (each) =>
          sameButCase(each.title, entry.title) &&
          sameButCase(each.authors[0] ?? '', entry.authors[0] ?? ''),
      );
      if (!known)
        listed.push({
          workKey: `${TYPED}${new ObjectId().toHexString()}`,
          title: entry.title,
          authors: entry.authors,
          ...(entry.isbn && { isbn: entry.isbn }),
          importId,
        });
    }
    counts.added++;
  }
  if (marked.length)
    await books().updateMany(
      { _id: { $in: marked } },
      { $addToSet: { lists: WANT_LIST } },
    );
  const fresh = listed.slice(list?.works?.length ?? 0);
  if (fresh.length) await changeListWorks(userId, WANT_LIST, fresh, []);
  return counts;
}

// What an import from another site put in the lists, taken out again;
// how many
export async function unwantImport(userId: ObjectId, importId: string) {
  const before = await getLists(userId);
  const count = before.reduce(
    (sum, list) =>
      sum + (list.works ?? []).filter((w) => w.importId === importId).length,
    0,
  );
  if (count)
    await lists().updateOne(
      { _id: userId },
      {
        $pull: { 'lists.$[].works': { importId } },
        $set: { updatedAt: new Date() },
      },
    );
  return count;
}
