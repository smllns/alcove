import { describe, expect, it } from 'vitest';
import { api, fresh, PASSWORD, signUp } from './api.js';

describe('the account', () => {
  it('takes a name, and gives it up when cleared', async () => {
    const { cookie } = await signUp();
    const set = await api('/account/name', {
      method: 'PATCH',
      cookie,
      body: { name: '  Marusya ' },
    });
    expect(set.body.user.name).toBe('Marusya');
    const cleared = await api('/account/name', {
      method: 'PATCH',
      cookie,
      body: { name: '' },
    });
    expect(cleared.body.user.name).toBeNull();
  });

  it('changes the username, unless someone has it', async () => {
    const other = await signUp();
    const { cookie } = await signUp();
    const next = fresh('new');
    const changed = await api('/account/username', {
      method: 'PATCH',
      cookie,
      body: { username: next },
    });
    expect(changed.body.user.username).toBe(next);
    const taken = await api('/account/username', {
      method: 'PATCH',
      cookie,
      body: { username: other.username },
    });
    expect(taken.status).toBe(409);
  });

  it('changes the email only with the password', async () => {
    const { cookie } = await signUp();
    const email = `${fresh()}@example.com`;
    const wrong = await api('/account/email', {
      method: 'PATCH',
      cookie,
      body: { email, password: 'nope' },
    });
    expect(wrong.status).toBe(400);
    const right = await api('/account/email', {
      method: 'PATCH',
      cookie,
      body: { email, password: PASSWORD },
    });
    expect(right.body.user.email).toBe(email);
  });

  it('goes, with its books, once the password confirms it', async () => {
    const { cookie, username } = await signUp();
    await api('/books', {
      method: 'POST',
      cookie,
      body: {
        title: 'Piranesi',
        authors: ['Susanna Clarke'],
        copy: { status: 'shelf' },
      },
    });
    const gone = await api('/account', {
      method: 'DELETE',
      cookie,
      body: { password: PASSWORD },
    });
    expect(gone.status).toBe(204);
    const login = await api('/auth/login', {
      method: 'POST',
      body: { email: `${username}@example.com`, password: PASSWORD },
    });
    expect(login.status).toBe(401);
  });
});
