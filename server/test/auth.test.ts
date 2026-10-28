import { describe, expect, it } from 'vitest';
import { api, fresh, PASSWORD, signUp } from './api.js';

describe('signing up', () => {
  it('asks for a username, kept lowercase without its @, and no name', async () => {
    const name = fresh('Ann');
    const res = await api('/auth/register', {
      method: 'POST',
      body: {
        username: `@${name}`,
        email: `${name}@example.com`,
        password: PASSWORD,
      },
    });
    expect(res.status).toBe(201);
    expect(res.body.user).toMatchObject({
      username: name.toLowerCase(),
      name: null,
    });
    expect(res.cookie).toMatch(/=/);
  });

  it('turns away a username someone has', async () => {
    const { username } = await signUp();
    const res = await api('/auth/register', {
      method: 'POST',
      body: {
        username,
        email: `other_${username}@example.com`,
        password: PASSWORD,
      },
    });
    expect(res.status).toBe(409);
    expect(res.body.error.fields).toHaveProperty('username');
  });

  it('turns away an email that has an account', async () => {
    const { username } = await signUp();
    const res = await api('/auth/register', {
      method: 'POST',
      body: {
        username: fresh(),
        email: `${username}@example.com`,
        password: PASSWORD,
      },
    });
    expect(res.status).toBe(409);
    expect(res.body.error.fields).toHaveProperty('email');
  });

  it('turns away a username that breaks the rules', async () => {
    for (const username of ['ab', 'has space', 'émile', 'x'.repeat(21)]) {
      const res = await api('/auth/register', {
        method: 'POST',
        body: { username, email: `${fresh()}@example.com`, password: PASSWORD },
      });
      expect(res.status, username).toBe(400);
      expect(res.body.error.fields).toHaveProperty('username');
    }
  });
});

describe('signing in and out', () => {
  it('logs in with the right password only', async () => {
    const { username } = await signUp();
    const email = `${username}@example.com`;
    const wrong = await api('/auth/login', {
      method: 'POST',
      body: { email, password: 'not-the-one' },
    });
    expect(wrong.status).toBe(401);
    const right = await api('/auth/login', {
      method: 'POST',
      body: { email, password: PASSWORD },
    });
    expect(right.status).toBe(200);
    expect(right.body.user.username).toBe(username);
  });

  it('knows who is signed in, until they log out', async () => {
    const { cookie, username } = await signUp();
    expect((await api('/auth/me', { cookie })).body.user.username).toBe(
      username,
    );
    expect((await api('/auth/me')).status).toBe(401);
    await api('/auth/logout', { method: 'POST', cookie });
    expect((await api('/auth/me', { cookie })).status).toBe(401);
  });
});
