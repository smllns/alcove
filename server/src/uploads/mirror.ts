import type { ObjectId } from 'mongodb';
import { books, type BookDoc } from '../db.js';
import { fetchRemoteImage } from './remoteImage.js';
import { deleteCover, saveCover, uploadsEnabled } from './storage.js';

// Covers from the catalogue load slowly: Open Library hands each one on to
// archive.org, which takes a couple of seconds and lets browsers keep it
// for only three hours. So we keep a copy of our own, in the large size,
// served from our storage and cached for good.

// Covers copied per request; the browser asks again while some are left
const BATCH = 6;

const waiting = (userId: ObjectId) => ({
  userId,
  'cover.source': 'openlibrary' as const,
  // One that couldn't be copied is left as it is rather than tried forever
  'cover.uncopied': { $ne: true },
});

const largest = (url: string) => url.replace(/-[SML]\.jpg$/, '-L.jpg');

async function copyOne(userId: ObjectId, book: Pick<BookDoc, '_id' | 'cover'>) {
  const original = book.cover!.url;
  try {
    const { bytes, type } = await fetchRemoteImage(largest(original));
    const url = await saveCover(userId, bytes, type);
    // Only if the book still has that cover (it may have changed meanwhile)
    const done = await books().updateOne(
      { _id: book._id, 'cover.url': original },
      { $set: { cover: { url, source: 'mirror' } } },
    );
    if (!done.modifiedCount) await deleteCover(url);
  } catch (err) {
    console.error('Copying a cover failed:', original, err);
    await books().updateOne(
      { _id: book._id, 'cover.url': original },
      { $set: { 'cover.uncopied': true } },
    );
  }
}

// Copies a few more of the reader's catalogue covers; how many are left
export async function copyCatalogueCovers(userId: ObjectId) {
  if (!uploadsEnabled()) return { remaining: 0 };
  const batch = await books()
    .find(waiting(userId), { projection: { cover: 1 } })
    .limit(BATCH)
    .toArray();
  await Promise.all(batch.map((book) => copyOne(userId, book)));
  return { remaining: await books().countDocuments(waiting(userId)) };
}
