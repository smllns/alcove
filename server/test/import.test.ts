import { describe, expect, it } from 'vitest';
import { api, signUp } from './api.js';
import { stubOpenLibrary } from './sites.js';

// The catalogue, as far as these books go: one ISBN it knows
stubOpenLibrary((url) =>
  Response.json({
    docs: url.searchParams.get('q')?.includes('9780061054884')
      ? [
          {
            key: '/works/OL59800W',
            title: 'Tehanu',
            author_name: ['Ursula K. Le Guin'],
            cover_i: 8,
            first_publish_year: 1990,
            isbn: ['0061054887', '9780061054884'],
          },
        ]
      : [],
  }),
);

const book = (title: string, isbn?: string) => ({
  title,
  authors: ['Ursula K. Le Guin'],
  isbn,
  copy: { status: 'shelf' },
});

describe('books brought over from another site', () => {
  it('finds each in the catalogue by its ISBN, the rest as they came', async () => {
    const { cookie } = await signUp();
    const { body } = await api('/books/import', {
      method: 'POST',
      cookie,
      body: {
        importId: 'a'.repeat(24),
        books: [
          book('Tehanu', '9780061054884'),
          book('The Other Wind', '9780441009770'),
        ],
      },
    });
    expect(body).toEqual({ added: 2, skipped: 0, failed: 0, unfound: 1 });
    const shelf = (await api('/books', { cookie })).body.books;
    const tehanu = shelf.find((b: { title: string }) => b.title === 'Tehanu');
    expect(tehanu).toMatchObject({
      openLibrary: { work: 'OL59800W' },
      firstPublishedYear: 1990,
      cover: { source: 'openlibrary' },
    });
  });

  it('puts the books wanted in Want to read, found or as they came', async () => {
    const { cookie } = await signUp();
    const wanted = {
      importId: 'b'.repeat(24),
      books: [
        {
          title: 'Tehanu',
          authors: ['Ursula K. Le Guin'],
          isbn: '9780061054884',
        },
        {
          title: 'Lavinia',
          authors: ['Ursula K. Le Guin'],
          isbn: '9780151014248',
        },
      ],
    };
    const first = await api('/lists/want-to-read/import', {
      method: 'POST',
      cookie,
      body: wanted,
    });
    expect(first.body).toEqual({ added: 2, unfound: 1 });
    // Again: nothing put in twice
    await api('/lists/want-to-read/import', {
      method: 'POST',
      cookie,
      body: wanted,
    });
    const works = (await api('/lists', { cookie })).body.lists[0].works;
    expect(
      works.map((w: { workKey: string }) => w.workKey.slice(0, 6)),
    ).toEqual(['OL5980', 'typed-']);
    // Not found, it keeps the ISBN it came with
    expect(works[1].isbn).toBe('9780151014248');
    const typed = works[1].workKey;
    const taken = await api('/lists/want-to-read/works', {
      method: 'PATCH',
      cookie,
      body: { remove: [typed] },
    });
    expect(taken.body.lists[0].works).toHaveLength(1);
  });

  it('undoes the latest import, and takes every book off at once', async () => {
    const { cookie } = await signUp();
    await api('/books', { method: 'POST', cookie, body: book('Kept by hand') });
    const importId = 'c'.repeat(24);
    await api('/books/import', {
      method: 'POST',
      cookie,
      body: { importId, books: [book('Tehanu'), book('The Other Wind')] },
    });
    await api('/lists/want-to-read/import', {
      method: 'POST',
      cookie,
      body: {
        importId,
        books: [{ title: 'Lavinia', authors: ['Ursula K. Le Guin'] }],
      },
    });
    const last = (await api('/books/imports/last', { cookie })).body.last;
    expect(last).toMatchObject({ id: importId, books: 2 });
    const undone = await api(`/books/imports/${importId}`, {
      method: 'DELETE',
      cookie,
    });
    expect(undone.body).toEqual({ deleted: 2, unlisted: 1 });
    const shelf = (await api('/books', { cookie })).body.books;
    expect(shelf.map((b: { title: string }) => b.title)).toEqual([
      'Kept by hand',
    ]);
    expect((await api('/lists', { cookie })).body.lists[0].works).toEqual([]);
    expect((await api('/books/imports/last', { cookie })).body.last).toBeNull();

    const all = await api('/books', { method: 'DELETE', cookie });
    expect(all.body).toEqual({ deleted: 1 });
    expect((await api('/books', { cookie })).body.total).toBe(0);
  });

  it('brings books over in a batch, leaving out those already there', async () => {
    const { cookie } = await signUp();
    await api('/books', { method: 'POST', cookie, body: book('Tehanu') });
    const { status, body } = await api('/books/import', {
      method: 'POST',
      cookie,
      body: {
        importId: 'a'.repeat(24),
        books: [
          book('Tehanu'),
          { ...book('The Other Wind'), copy: { reading: 'read', rating: 4 } },
          { title: '', authors: [] },
        ],
      },
    });
    expect(status).toBe(200);
    expect(body).toEqual({ added: 1, skipped: 1, failed: 1, unfound: 1 });
    expect((await api('/books', { cookie })).body.total).toBe(2);
  });
});
