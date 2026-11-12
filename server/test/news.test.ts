import { describe, expect, it } from 'vitest';

// The one running alcove, by their email, before the app reads its settings
process.env.ADMIN_EMAILS = 'news_boss@example.com';
const { api, signUp } = await import('./api.js');

describe('alcove’s news', () => {
  it('is written by those who run alcove, and in every reader’s feed', async () => {
    const boss = await signUp('news_boss');
    expect(boss.user.admin).toBe(true);
    const reader = await signUp();
    expect(reader.user.admin).toBe(false);
    const piece = {
      title: 'Lists can be shared',
      body: 'Make a list public and anyone can find it.',
      link: { label: 'Open Lists', to: '/library/lists' },
    };
    const refused = await api('/news', {
      method: 'POST',
      cookie: reader.cookie,
      body: piece,
    });
    expect(refused.status).toBe(403);
    const made = await api('/news', {
      method: 'POST',
      cookie: boss.cookie,
      body: piece,
    });
    expect(made.status).toBe(201);
    const feed = (await api('/users/feed', { cookie: reader.cookie })).body;
    expect(feed.items[0]).toMatchObject({ kind: 'news', news: piece });
    expect(feed.unread).toBeGreaterThan(0);
    await api(`/news/${made.body.news.id}`, {
      method: 'DELETE',
      cookie: boss.cookie,
    });
    const after = (await api('/users/feed', { cookie: reader.cookie })).body;
    expect(
      after.items.some(
        (each: { news?: { title: string } }) =>
          each.news?.title === piece.title,
      ),
    ).toBe(false);
  });
});
