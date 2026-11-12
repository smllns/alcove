import { describe, expect, it } from 'vitest';
import { api, signUp } from './api.js';
import { stubOpenLibrary } from './sites.js';

stubOpenLibrary();

type Item = {
  id: string;
  kind: string;
  forYou: boolean;
  reader: { username: string };
  book?: { title: string; review?: string };
};
// The feed as readers make it, without alcove's own news
const feed = async (cookie: string) => {
  const { items, unread } = (await api('/users/feed', { cookie })).body as {
    items: Item[];
    unread: number;
  };
  return { items: items.filter((each) => each.kind !== 'news'), unread };
};

describe('the feed', () => {
  it('shows a follower what those they follow do, as far as they may see it, and each reader what was done for them', async () => {
    const anna = await signUp();
    const me = await signUp();
    // What she did before she was followed isn't in it
    await api('/books', {
      method: 'POST',
      cookie: anna.cookie,
      body: { title: 'Before', authors: ['X'], copy: { status: 'shelf' } },
    });
    await api(`/users/readers/${anna.username}/follow`, {
      method: 'POST',
      cookie: me.cookie,
    });
    // Anna is told she's followed
    expect((await feed(anna.cookie)).items[0]).toMatchObject({
      kind: 'followed',
      forYou: true,
      reader: { username: me.username },
    });

    const added = await api('/books', {
      method: 'POST',
      cookie: anna.cookie,
      body: { title: 'A Novel', authors: ['X'], copy: { status: 'shelf' } },
    });
    const book = added.body.book;
    await api(`/books/${book.id}`, {
      method: 'PUT',
      cookie: anna.cookie,
      body: {
        title: 'A Novel',
        authors: ['X'],
        copy: {
          status: 'shelf',
          reading: 'reading',
          started: '2026-01-02',
          review: 'Slow and lovely.',
        },
      },
    });
    const seen = await feed(me.cookie);
    expect(seen.items.map((each) => each.kind).sort()).toEqual([
      'added',
      'reviewed',
      'started',
    ]);
    expect(
      seen.items.find((each) => each.kind === 'reviewed')?.book,
    ).toMatchObject({
      title: 'A Novel',
      review: 'Slow and lovely.',
    });
    // Theirs, and alcove's news, all new to me
    expect(seen.unread).toBeGreaterThanOrEqual(3);
    await api('/users/feed/seen', { method: 'POST', cookie: me.cookie });
    expect((await feed(me.cookie)).unread).toBe(0);

    // What Anna keeps to herself isn't in it
    await api('/account/privacy', {
      method: 'PATCH',
      cookie: anna.cookie,
      body: { reading: 'me' },
    });
    expect(
      (await feed(me.cookie)).items.some((each) => each.kind === 'started'),
    ).toBe(false);

    // A heart on her review, told to her, and taken back
    const like = (on: boolean) =>
      api(`/users/reviews/${book.id}/like`, {
        method: on ? 'POST' : 'DELETE',
        cookie: me.cookie,
      });
    await like(true);
    expect((await feed(anna.cookie)).items[0]).toMatchObject({
      kind: 'liked',
      book: { title: 'A Novel' },
    });
    await like(false);
    expect(
      (await feed(anna.cookie)).items.some((each) => each.kind === 'liked'),
    ).toBe(false);
  });

  it('shows a follower a book as the reader’s page would, and no more', async () => {
    const anna = await signUp();
    const me = await signUp();
    await api(`/users/readers/${anna.username}/follow`, {
      method: 'POST',
      cookie: me.cookie,
    });
    // Her books kept to herself, her year in reading not
    await api('/account/privacy', {
      method: 'PATCH',
      cookie: anna.cookie,
      body: { books: 'me', year: 'followers' },
    });
    const year = new Date().getFullYear();
    const read = (title: string, finished: string) =>
      api('/books', {
        method: 'POST',
        cookie: anna.cookie,
        body: {
          title,
          authors: ['X'],
          copy: { status: 'shelf', reading: 'read', finished },
        },
      });
    await read('Long Ago', '2019-05-01');
    await read('This Year', `${year}-01-02`);
    const titles = (await feed(me.cookie)).items.map(
      (each) => `${each.kind} ${each.book?.title}`,
    );
    // Only the one her year shows
    expect(titles).toContain('added This Year');
    expect(titles.some((each) => each.includes('Long Ago'))).toBe(false);
  });
});
