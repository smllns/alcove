import { randomUUID } from 'node:crypto';
import { del, list, put } from '@vercel/blob';
import type { ObjectId } from 'mongodb';
import { storedCoversInUse } from '../books/repository.js';
import { config } from '../config.js';
import { HttpError } from '../lib/errors.js';

// Cover photos live in Vercel Blob, one folder per reader.
//
// On Vercel a connected store sets BLOB_STORE_ID and the function gets a
// short-lived OIDC token on its own. Elsewhere a BLOB_READ_WRITE_TOKEN works,
// and is passed explicitly when set: the SDK would otherwise prefer an OIDC
// token it finds through the linked project, which the store may not accept
// outside production.
const auth = config.BLOB_READ_WRITE_TOKEN
  ? { token: config.BLOB_READ_WRITE_TOKEN }
  : {};

const YEAR = 365 * 24 * 60 * 60;

const folder = (userId: ObjectId) => `covers/${userId.toHexString()}/`;

export const uploadsEnabled = () =>
  Boolean(config.BLOB_STORE_ID || config.BLOB_READ_WRITE_TOKEN);

export function ensureEnabled() {
  if (!uploadsEnabled()) {
    throw new HttpError(
      503,
      'uploads_unavailable',
      'Photo uploads aren’t set up yet.',
    );
  }
}

export async function saveCover(
  userId: ObjectId,
  image: Buffer,
  contentType: string,
) {
  ensureEnabled();
  const extension = contentType.split('/')[1];
  try {
    const blob = await put(
      `${folder(userId)}${randomUUID()}.${extension}`,
      image,
      // Every file has a name of its own, so it never needs checking again
      { access: 'public', contentType, cacheControlMaxAge: YEAR, ...auth },
    );
    return blob.url;
  } catch (err) {
    // Usually missing or expired credentials; the details belong in the logs
    console.error('Cover upload failed:', err);
    throw new HttpError(
      502,
      'upload_failed',
      'The photo couldn’t be saved. Try again in a moment.',
    );
  }
}

export async function deleteCover(url: string) {
  if (uploadsEnabled()) await del(url, auth);
}

// Whether `url` is one of this reader's own uploads
function isOwnCover(userId: ObjectId, url: string) {
  try {
    const { protocol, hostname, pathname } = new URL(url);
    return (
      protocol === 'https:' &&
      hostname.endsWith('.public.blob.vercel-storage.com') &&
      pathname.startsWith(`/${folder(userId)}`)
    );
  } catch {
    return false;
  }
}

// A photo the reader uploaded and then didn't use, gone straight away
export async function discardCover(userId: ObjectId, url: string) {
  if (!isOwnCover(userId, url)) return;
  if ((await storedCoversInUse(userId)).has(url)) return;
  await deleteCover(url);
}

// Uploads no book ended up using, e.g. the reader left the form without
// saving. Anything newer than a day may still be in a form that's open.
const ORPHAN_AFTER_MS = 24 * 60 * 60 * 1000;
export async function sweepOrphanCovers(
  userId: ObjectId,
  olderThanMs = ORPHAN_AFTER_MS,
) {
  if (!uploadsEnabled()) return;
  const [{ blobs }, inUse] = await Promise.all([
    list({ prefix: folder(userId), ...auth }),
    storedCoversInUse(userId),
  ]);
  const cutoff = Date.now() - olderThanMs;
  const orphans = blobs
    .filter((b) => !inUse.has(b.url) && b.uploadedAt.getTime() < cutoff)
    .map((b) => b.url);
  if (orphans.length) await del(orphans, auth);
}

// Everything a reader uploaded, e.g. when their account is deleted
export async function deleteAllCovers(userId: ObjectId) {
  if (!uploadsEnabled()) return;
  let cursor: string | undefined;
  do {
    const page = await list({ prefix: folder(userId), cursor, ...auth });
    if (page.blobs.length)
      await del(
        page.blobs.map((b) => b.url),
        auth,
      );
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);
}
