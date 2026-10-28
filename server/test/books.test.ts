import { describe, expect, it } from 'vitest';
import { api, signUp } from './api.js';

const book = (title: string) => ({
  title,
  authors: ['Ursula K. Le Guin'],
  copy: { status: 'shelf' },
});

describe('a reader’s books', () => {
  it('adds, reads, changes and removes a book', async () => {
    const { cookie } = await signUp();
    const added = await api('/books', {
      method: 'POST',
      cookie,
      body: book('The Dispossessed'),
    });
    expect(added.status).toBe(201);
    const id = added.body.book.id;

    expect((await api(`/books/${id}`, { cookie })).body.book.title).toBe(
      'The Dispossessed',
    );
    const changed = await api(`/books/${id}`, {
      method: 'PUT',
      cookie,
      body: { ...book('The Dispossessed'), pages: 387 },
    });
    expect(changed.body.book.pages).toBe(387);

    expect(
      (await api(`/books/${id}`, { method: 'DELETE', cookie })).status,
    ).toBe(204);
    expect((await api(`/books/${id}`, { cookie })).status).toBe(404);
  });

  it('lists them newest first, with how many there are', async () => {
    const { cookie } = await signUp();
    for (const title of [
      'A Wizard of Earthsea',
      'The Tombs of Atuan',
      'The Farthest Shore',
    ])
      await api('/books', { method: 'POST', cookie, body: book(title) });
    const { body } = await api('/books', { cookie });
    expect(body.total).toBe(3);
    expect(body.books.map((b: { title: string }) => b.title)).toEqual([
      'The Farthest Shore',
      'The Tombs of Atuan',
      'A Wizard of Earthsea',
    ]);
  });

  it('keeps each reader’s books to themselves', async () => {
    const mine = await signUp();
    const theirs = await signUp();
    const added = await api('/books', {
      method: 'POST',
      cookie: mine.cookie,
      body: book('Tehanu'),
    });
    const id = added.body.book.id;
    expect((await api(`/books/${id}`, { cookie: theirs.cookie })).status).toBe(
      404,
    );
    expect(
      (await api(`/books/${id}`, { method: 'DELETE', cookie: theirs.cookie }))
        .status,
    ).toBe(404);
    expect((await api('/books', { cookie: theirs.cookie })).body.total).toBe(0);
  });

  it('needs a title and someone who wrote it', async () => {
    const { cookie } = await signUp();
    const res = await api('/books', {
      method: 'POST',
      cookie,
      body: { title: ' ', authors: [], copy: { status: 'shelf' } },
    });
    expect(res.status).toBe(400);
    expect(Object.keys(res.body.error.fields)).toEqual(
      expect.arrayContaining(['title', 'authors']),
    );
  });
});
