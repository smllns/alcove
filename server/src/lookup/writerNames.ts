import type { ObjectId } from 'mongodb';
import { books, writerNames } from '../db.js';

// The names a writer goes by, however readers and the catalogue write them
// ("Annie Ernaux", "Анни Эрно"), known as one writer by their item on
// Wikidata: each name noted as it's found to be theirs, for every reader

// What a name is said as here: as written, spaces tidied
const tidy = (name: string) => name.trim().replace(/\s+/g, ' ');

// Whether `name` is already noted as the writer whose item is `item`
export const nameNoted = async (item: string, name: string) =>
  Boolean(await writerNames().findOne({ _id: tidy(name), item }));

// `names` found to be the writer whose item is `item`; whether any of them
// wasn't known to be theirs before
export async function noteWriterNames(item: string, names: string[]) {
  const said = [...new Set(names.map(tidy).filter(Boolean))];
  if (!said.length) return false;
  const done = await writerNames().bulkWrite(
    said.map((name) => ({
      updateOne: {
        filter: { _id: name },
        update: { $set: { item }, $setOnInsert: { at: new Date() } },
        upsert: true,
      },
    })),
  );
  return done.upsertedCount + done.modifiedCount > 0;
}

// For `names`, each writer's other names: every name known to be one of
// theirs, in a group for each writer of more than one
export async function sameWriters(names: string[]) {
  const asked = await writerNames()
    .find({ _id: { $in: names.map(tidy) } })
    .toArray();
  const items = [...new Set(asked.map((each) => each.item))];
  if (!items.length) return [];
  const all = await writerNames()
    .find({ item: { $in: items } })
    .toArray();
  const groups = new Map<string, string[]>();
  for (const each of all)
    groups.set(each.item, [...(groups.get(each.item) ?? []), each._id]);
  return [...groups.values()].filter((group) => group.length > 1);
}

// The writers of the reader's own books, as their books have them
export const ownAuthors = (userId: ObjectId) =>
  books().distinct('authors', { userId }) as Promise<string[]>;
