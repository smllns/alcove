import type { AddressInfo } from 'node:net';
import type { Server } from 'node:http';
import { afterAll, beforeAll } from 'vitest';

// The API, running for a test file: requests to it as the browser makes
// them, a reader signed up in one go, and a name no other test has used
let server: Server;
let base = '';

beforeAll(async () => {
  const { connectDb } = await import('../src/db.js');
  const { createApp } = await import('../src/app.js');
  await connectDb();
  server = createApp().listen(0);
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}/api`;
});

afterAll(async () => {
  const { disconnectDb } = await import('../src/db.js');
  await new Promise((done) => server.close(done));
  await disconnectDb();
});

// What came back, read loosely: each test looks at the fields it's about
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Answer = { status: number; body: any; cookie?: string };

export async function api(
  path: string,
  {
    method = 'GET',
    body,
    cookie,
  }: { method?: string; body?: unknown; cookie?: string } = {},
): Promise<Answer> {
  const res = await fetch(base + path, {
    method,
    headers: {
      ...(body !== undefined && { 'Content-Type': 'application/json' }),
      ...(cookie && { Cookie: cookie }),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  return {
    status: res.status,
    body: text ? JSON.parse(text) : null,
    cookie: res.headers.get('set-cookie')?.split(';')[0],
  };
}

let count = 0;
// A username (and email) nobody's taken yet in this run
export const fresh = (prefix = 'reader') =>
  `${prefix}_${process.pid}_${++count}`;

export const PASSWORD = 'shelf-pass-1';

// A reader signed up, with the cookie that signs them in
export async function signUp(username = fresh()) {
  const res = await api('/auth/register', {
    method: 'POST',
    body: { username, email: `${username}@example.com`, password: PASSWORD },
  });
  if (res.status !== 201) throw new Error(`Sign-up failed: ${res.status}`);
  return { cookie: res.cookie!, user: res.body.user, username };
}
