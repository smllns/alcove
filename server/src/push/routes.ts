import { Router } from 'express';
import { z } from 'zod';
import { currentUser } from '../auth/middleware.js';
import { config } from '../config.js';
import { pushSubscriptions } from '../db.js';
import { parseBody } from '../lib/validation.js';
import { pushOn } from './send.js';

// A reader's devices taking notifications or no longer: the key a device
// asks its push service to take alcove's messages by, and each device
// told of or let go. Mounted behind requireUser.
export const pushRouter = Router();

const endpoint = z.url().startsWith('https://').max(1000);
const deviceSchema = z.object({
  endpoint,
  keys: z.object({
    p256dh: z.string().min(1).max(200),
    auth: z.string().min(1).max(100),
  }),
});

// None when notifications are off here
pushRouter.get('/key', (_req, res) => {
  res.json({ key: pushOn ? config.VAPID_PUBLIC_KEY : null });
});

// A device taking notifications, as the reader signed in on it now
pushRouter.post('/devices', async (req, res) => {
  const { endpoint, keys } = parseBody(deviceSchema, req.body);
  await pushSubscriptions().updateOne(
    { endpoint },
    {
      $set: { userId: currentUser(req)._id, keys },
      $setOnInsert: { createdAt: new Date() },
    },
    { upsert: true },
  );
  res.status(204).end();
});

pushRouter.delete('/devices', async (req, res) => {
  const { endpoint: gone } = parseBody(z.object({ endpoint }), req.body);
  await pushSubscriptions().deleteOne({
    endpoint: gone,
    userId: currentUser(req)._id,
  });
  res.status(204).end();
});
