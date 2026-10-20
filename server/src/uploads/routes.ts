import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { z } from 'zod';
import { currentUser } from '../auth/middleware.js';
import { HttpError } from '../lib/errors.js';
import { parseBody } from '../lib/validation.js';
import { imageType } from './imageType.js';
import { fetchRemoteImage } from './remoteImage.js';
import {
  discardCover,
  ensureEnabled,
  saveCover,
  sweepOrphanCovers,
  uploadsEnabled,
} from './storage.js';

// Cover photos. The browser shrinks the picture first and sends it as a data
// URL, which keeps uploads inside the JSON-only API. A picture from a link
// is fetched here and handed back to the browser to shrink and upload the
// same way. Mounted behind requireUser.
export const uploadsRouter = Router();

const MAX_BYTES = 2 * 1024 * 1024;

uploadsRouter.use(
  rateLimit({
    windowMs: 60 * 1000,
    limit: 30,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    handler: (_req, _res, next) =>
      next(
        new HttpError(
          429,
          'too_many_uploads',
          'That’s a lot of pictures at once. Give it a minute.',
        ),
      ),
  }),
);

const coverSchema = z.object({
  image: z
    .string()
    .regex(
      /^data:image\/(jpeg|png|webp);base64,/,
      'Upload a JPEG, PNG or WebP picture.',
    ),
});
const linkSchema = z.object({
  url: z.string().trim().min(1, 'Paste the link here.').max(2000),
});

// Lets the page hide the upload button when storage isn't configured
uploadsRouter.get('/status', (_req, res) => {
  res.json({ enabled: uploadsEnabled() });
});

uploadsRouter.post('/cover', async (req, res) => {
  const { image } = parseBody(coverSchema, req.body);
  const bytes = Buffer.from(image.slice(image.indexOf(',') + 1), 'base64');
  if (bytes.length > MAX_BYTES) {
    throw new HttpError(
      413,
      'too_large',
      'That picture is too big, even after shrinking.',
    );
  }
  // The browser always re-encodes, so anything else wasn't shrunk by us
  const contentType = imageType(bytes);
  if (!contentType || contentType === 'image/gif')
    throw new HttpError(400, 'not_an_image', 'That isn’t a picture.');
  const me = currentUser(req)._id;
  const [url] = await Promise.all([
    saveCover(me, bytes, contentType),
    // A good moment to clear out photos earlier forms left behind
    sweepOrphanCovers(me).catch((err) =>
      console.error('Sweeping old covers failed:', err),
    ),
  ]);
  res.status(201).json({ url });
});

// The picture at a link, as is, for the browser to shrink and upload
uploadsRouter.post('/cover/fetch', async (req, res) => {
  ensureEnabled();
  const { url } = parseBody(linkSchema, req.body);
  const { bytes, type } = await fetchRemoteImage(url);
  res.type(type).send(bytes);
});

// A photo uploaded for the form and then swapped for another
uploadsRouter.post('/cover/discard', async (req, res) => {
  const { url } = parseBody(linkSchema, req.body);
  await discardCover(currentUser(req)._id, url);
  res.status(204).end();
});
