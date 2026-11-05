import { describe, expect, it } from 'vitest';
import { api, signUp } from './api.js';
import { stubOpenLibrary } from './sites.js';

// No test asks the real catalogue (a book with a work warms its lists)
stubOpenLibrary();

const work = (workKey: string, title: string) => ({
  workKey,
  title,
  authors: ['Ursula K. Le Guin'],
  coverUrl: 'https://covers.openlibrary.org/b/id/1-M.jpg',
});

describe('Want to read', () => {
  it('keeps Want to read for every reader, emptied as books are read', async () => {
    const { cookie } = await signUp();
    const lists = (await api('/lists', { cookie })).body.lists;
    expect(lists[0]).toMatchObject({
      id: 'want-to-read',
      name: 'Want to read',
    });
    expect(
      (await api('/lists/want-to-read', { method: 'DELETE', cookie })).status,
    ).toBe(400);
    const added = await api('/books', {
      method: 'POST',
      cookie,
      body: {
        title: 'Tehanu',
        authors: ['Ursula K. Le Guin'],
        lists: ['want-to-read'],
        copy: { status: 'shelf' },
      },
    });
    expect(added.body.book.lists).toEqual(['want-to-read']);
    const read = await api(`/books/${added.body.book.id}`, {
      method: 'PUT',
      cookie,
      body: {
        title: 'Tehanu',
        authors: ['Ursula K. Le Guin'],
        lists: ['want-to-read'],
        copy: { status: 'shelf', reading: 'read' },
      },
    });
    expect(read.body.book.lists).toEqual([]);
    // Begun, it leaves as well
    const again = await api(`/books/${added.body.book.id}`, {
      method: 'PUT',
      cookie,
      body: {
        title: 'Tehanu',
        authors: ['Ursula K. Le Guin'],
        lists: ['want-to-read'],
        copy: { status: 'shelf', reading: 'reading' },
      },
    });
    expect(again.body.book.lists).toEqual([]);
  });

  it('turns a wanted book from the catalogue into the reader’s own', async () => {
    const { cookie } = await signUp();
    await api('/lists', { cookie });
    await api('/lists/want-to-read/works', {
      method: 'PATCH',
      cookie,
      body: { add: [work('OL59800W', 'The Dispossessed')] },
    });
    const added = await api('/books', {
      method: 'POST',
      cookie,
      body: {
        title: 'The Dispossessed',
        authors: ['Ursula K. Le Guin'],
        openLibrary: { work: 'OL59800W' },
        copy: { status: 'shelf' },
      },
    });
    expect(added.body.book.lists).toEqual(['want-to-read']);
    const { body } = await api('/lists', { cookie });
    expect(body.lists[0].works).toEqual([]);
    expect(body.counts['want-to-read']).toBe(1);
  });
});
