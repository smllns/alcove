import { afterEach, describe, expect, it } from 'vitest';
import { api, signUp } from './api.js';
import { stubOpenLibrary } from './sites.js';

// Open Library as it answers about readers' lists: one list of editions,
// which it gives, said something of by its maker; one holding works,
// which it fails on; one empty
const answers: Record<string, () => Response> = {
  '/search/lists.json': () =>
    Response.json({
      docs: [
        {
          url: '/people/ann/lists/OL1L',
          name: 'Booker  winners',
          seed_count: 2,
        },
        { url: '/people/bob/lists/OL2L', name: 'Booker works', seed_count: 5 },
        { url: '/people/cat/lists/OL3L', name: 'Booker empty', seed_count: 0 },
      ],
    }),
  '/people/ann/lists/OL1L/seeds.json': () =>
    Response.json({
      entries: [
        { url: '/books/OL10M/Wolf_Hall' },
        { url: '/books/OL20M/Milkman' },
      ],
    }),
  '/people/ann/lists/OL1L.json': () =>
    Response.json({
      name: 'Booker winners',
      description: { type: '/type/text', value: 'Every **winner**, in order.' },
    }),
  '/people/bob/lists/OL2L/seeds.json': () =>
    new Response('Internal error', { status: 500 }),
  '/search.json': () =>
    Response.json({
      docs: [
        {
          key: '/works/OL2W',
          title: 'Milkman',
          edition_key: ['OL20M', 'OL21M'],
        },
        { key: '/works/OL1W', title: 'Wolf Hall', edition_key: ['OL10M'] },
      ],
    }),
};

const asked: string[] = [];
stubOpenLibrary((url) => {
  asked.push(url.pathname);
  return answers[url.pathname]?.();
});
afterEach(() => void (asked.length = 0));

describe('readers’ lists on Open Library', () => {
  it('finds lists, keeps only those whose books it can show, and opens them', async () => {
    const { cookie } = await signUp();

    // At once, the biggest first, still to be looked into, the empty one
    // left out
    const found = await api('/lookup/lists?q=booker', { cookie });
    expect(found.body.lists).toEqual([
      { owner: 'bob', id: 'OL2L', name: 'Booker works', books: 5 },
      { owner: 'ann', id: 'OL1L', name: 'Booker winners', books: 2 },
    ]);
    // Each looked into on its own
    expect(
      (await api('/lookup/lists/ann/OL1L/check', { cookie })).body,
    ).toEqual({ books: 2 });
    expect(
      (await api('/lookup/lists/bob/OL2L/check', { cookie })).body,
    ).toEqual({ books: 0 });
    // Found again, known: the one that can't be shown is gone
    expect(
      (await api('/lookup/lists?q=booker', { cookie })).body.lists,
    ).toEqual([
      {
        owner: 'ann',
        id: 'OL1L',
        name: 'Booker winners',
        books: 2,
        readable: true,
      },
    ]);

    asked.length = 0;
    const opened = await api('/lookup/lists/ann/OL1L', { cookie });
    expect(opened.body.list).toMatchObject({
      name: 'Booker winners',
      description: 'Every winner, in order.',
      books: 2,
      more: false,
    });
    expect(
      opened.body.list.works.map((w: { title: string }) => w.title),
    ).toEqual(['Wolf Hall', 'Milkman']);
    // Its books were looked into as it was found: only the catalogue's
    // search for them is asked now, and what the list says of itself
    expect(asked.sort()).toEqual([
      '/people/ann/lists/OL1L.json',
      '/search.json',
    ]);

    expect((await api('/lookup/lists/bob/OL2L', { cookie })).status).toBe(404);
    expect(asked.filter((path) => path.includes('seeds'))).toHaveLength(0);
  }, 20_000);
});
