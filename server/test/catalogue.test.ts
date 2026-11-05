import { describe, expect, it } from 'vitest';
import { api, signUp } from './api.js';
import { stubOpenLibrary } from './sites.js';

// Open Library, knowing none of these books
stubOpenLibrary((url) =>
  url.pathname.startsWith('/isbn/')
    ? undefined
    : Response.json({ docs: [], numFound: 0 }),
);

const book = (fields: Record<string, unknown>) => ({
  authors: ['Людмила Улицкая'],
  copy: { status: 'shelf' },
  ...fields,
});

// Each search asks the (stand-in) catalogue a few times, at its pace
describe('alcove’s own catalogue', () => {
  it('keeps the printings readers add, found by ISBN and by words', async () => {
    const first = await signUp();
    // An ISBN-10, kept as its ISBN-13
    await api('/books', {
      method: 'POST',
      cookie: first.cookie,
      body: book({ title: 'Казус Кукоцкого', isbn: '5699120262', pages: 480 }),
    });
    const second = await signUp();
    // Another reader's copy fills in only what was missing
    await api('/books', {
      method: 'POST',
      cookie: second.cookie,
      body: book({
        title: 'Kukotsky',
        isbn: '9785699120260',
        pages: 999,
        publisher: 'Эксмо',
      }),
    });

    const byIsbn = await api('/lookup/search?q=9785699120260', {
      cookie: second.cookie,
    });
    expect(byIsbn.body.results).toEqual([]);
    expect(byIsbn.body.ours).toEqual([
      expect.objectContaining({
        isbn: '9785699120260',
        title: 'Казус Кукоцкого',
        pages: 480,
        publisher: 'Эксмо',
      }),
    ]);

    const byWords = await api(
      `/lookup/search?q=${encodeURIComponent('Кукоцкого')}`,
      {
        cookie: second.cookie,
      },
    );
    expect(byWords.body.ours.map((e: { isbn: string }) => e.isbn)).toEqual([
      '9785699120260',
    ]);
  }, 15_000);
});
