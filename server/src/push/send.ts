import type { Filter, ObjectId } from 'mongodb';
import webpush from 'web-push';
import { config } from '../config.js';
import { pushSubscriptions, type PushSubscriptionDoc } from '../db.js';

// Notifications sent to readers' devices through their push services (Web
// Push): signed with alcove's keys, sealed for each device, and a device
// its push service no longer knows (the app taken off the phone,
// notifications turned off there) forgotten

// A notification as a device shows it, and where tapping it opens
export type Message = {
  title: string;
  body?: string;
  url: string;
  // One of a kind shows in place of the last, not beside it
  tag?: string;
};

const [admin] = config.admins;
const subject = config.VAPID_SUBJECT ?? (admin && `mailto:${admin}`);

// Whether notifications can be sent at all
export const pushOn = Boolean(
  config.VAPID_PUBLIC_KEY && config.VAPID_PRIVATE_KEY && subject,
);
if (pushOn)
  webpush.setVapidDetails(
    subject!,
    config.VAPID_PUBLIC_KEY!,
    config.VAPID_PRIVATE_KEY!,
  );

// How long a push service is waited for, and how long it keeps a message
// for a device that's off
const WAIT_MS = 5000;
const KEEP_S = 24 * 60 * 60;

// `message` to every device of the readers `filter` finds
export async function pushTo(
  filter: Filter<PushSubscriptionDoc>,
  message: Message,
) {
  if (!pushOn) return;
  const devices = await pushSubscriptions().find(filter).toArray();
  const gone: ObjectId[] = [];
  await Promise.allSettled(
    devices.map(({ _id, endpoint, keys }) =>
      webpush
        .sendNotification({ endpoint, keys }, JSON.stringify(message), {
          TTL: KEEP_S,
          timeout: WAIT_MS,
        })
        .catch((err: { statusCode?: number }) => {
          if (err.statusCode === 404 || err.statusCode === 410) gone.push(_id);
        }),
    ),
  );
  if (gone.length) await pushSubscriptions().deleteMany({ _id: { $in: gone } });
}
