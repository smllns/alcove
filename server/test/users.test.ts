import { describe, expect, it } from 'vitest';
import { api, fresh, signUp } from './api.js';

describe('finding readers', () => {
  it('finds them by the start of a username, with or without @, and by name', async () => {
    const tag = fresh('fi');
    const anna = await signUp(`${tag}_anna`);
    await api('/account/name', {
      method: 'PATCH',
      cookie: anna.cookie,
      body: { name: 'Anna Petrova' },
    });
    const me = await signUp();

    const byHandle = (
      await api(`/users/search?q=@${tag}`, { cookie: me.cookie })
    ).body.readers;
    expect(byHandle).toEqual([
      { username: anna.username, name: 'Anna Petrova', you: false },
    ]);

    const byName = (await api('/users/search?q=petrova', { cookie: me.cookie }))
      .body.readers;
    expect(byName.map((r: { username: string }) => r.username)).toContain(
      anna.username,
    );
  });

  it('marks the reader themself, and shows no one’s email', async () => {
    const me = await signUp();
    const [found] = (
      await api(`/users/search?q=${me.username}`, { cookie: me.cookie })
    ).body.readers;
    expect(found).toEqual({ username: me.username, name: null, you: true });
  });

  it('is only for those signed in', async () => {
    expect((await api('/users/search?q=a')).status).toBe(401);
  });
});
