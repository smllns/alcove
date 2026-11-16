import { describe, expect, it, vi } from 'vitest';

// The push services stood in for: what would go to each device is kept
const sent = vi.hoisted(() => [] as { endpoint: string; message: unknown }[]);
vi.mock('web-push', () => ({
  default: {
    setVapidDetails: () => {},
    sendNotification: async (device: { endpoint: string }, body: string) => {
      if (device.endpoint.endsWith('/gone'))
        throw Object.assign(new Error('Gone'), { statusCode: 410 });
      sent.push({ endpoint: device.endpoint, message: JSON.parse(body) });
    },
  },
}));

// Keys to sign with, and the one running alcove, before the app reads its
// settings
Object.assign(process.env, {
  VAPID_PUBLIC_KEY: 'public-key',
  VAPID_PRIVATE_KEY: 'private-key',
  ADMIN_EMAILS: 'push_boss@example.com',
});
const { api, signUp } = await import('./api.js');

const device = (name: string) => ({
  endpoint: `https://push.example/${name}`,
  keys: { p256dh: 'p256dh-key', auth: 'auth-key' },
});
const to = (name: string) =>
  sent
    .filter((each) => each.endpoint === `https://push.example/${name}`)
    .map((each) => each.message);

describe('notifications', () => {
  it('tell a reader on their devices what was done for them, and everyone the news', async () => {
    const anna = await signUp();
    const me = await signUp();
    expect((await api('/push/key', { cookie: anna.cookie })).body.key).toBe(
      'public-key',
    );
    for (const name of ['anna-phone', 'gone'])
      await api('/push/devices', {
        method: 'POST',
        cookie: anna.cookie,
        body: device(name),
      });

    await api(`/users/readers/${anna.username}/follow`, {
      method: 'POST',
      cookie: me.cookie,
    });
    expect(to('anna-phone')).toEqual([
      expect.objectContaining({
        title: `@${me.username} started following you`,
        url: `/library/readers/${me.username}`,
      }),
    ]);

    // News, to everyone's devices (one its push service no longer knows
    // passed over)
    sent.length = 0;
    const boss = await signUp('push_boss');
    await api('/news', {
      method: 'POST',
      cookie: boss.cookie,
      body: { title: 'Notifications are here', body: 'On your phone too.' },
    });
    expect(to('anna-phone')).toEqual([
      expect.objectContaining({ title: 'Notifications are here' }),
    ]);

    // Turned off on the phone: nothing more there
    sent.length = 0;
    await api('/push/devices', {
      method: 'DELETE',
      cookie: anna.cookie,
      body: { endpoint: device('anna-phone').endpoint },
    });
    await api(`/users/readers/${anna.username}/follow`, {
      method: 'DELETE',
      cookie: me.cookie,
    });
    await api(`/users/readers/${anna.username}/follow`, {
      method: 'POST',
      cookie: me.cookie,
    });
    expect(to('anna-phone')).toEqual([]);
  });
});
