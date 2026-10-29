import { describe, expect, it } from 'vitest';
import { api, signUp } from './api.js';

const work = (workKey: string, title: string) => ({
  workKey,
  title,
  authors: ['Ursula K. Le Guin'],
  coverUrl: 'https://covers.openlibrary.org/b/id/1-M.jpg',
});

describe('a reader’s lists', () => {
  it('keeps books from the catalogue, counted once beside a copy', async () => {
    const { cookie } = await signUp();
    const id = (
      await api('/lists', {
        method: 'POST',
        cookie,
        body: { name: 'To read' },
      })
    ).body.list.id;
    await api('/books', {
      method: 'POST',
      cookie,
      body: {
        title: 'The Dispossessed',
        authors: ['Ursula K. Le Guin'],
        lists: [id],
        openLibrary: { work: 'OL59800W' },
        copy: { status: 'shelf' },
      },
    });
    const works = (body: unknown) =>
      api(`/lists/${id}/works`, { method: 'PATCH', cookie, body });

    const added = await works({
      add: [work('OL59800W', 'The Dispossessed'), work('OL59796W', 'Tehanu')],
    });
    expect(added.status).toBe(200);
    expect(added.body.counts[id]).toBe(2);
    expect(
      added.body.lists[0].works.map((w: { title: string }) => w.title),
    ).toEqual(['The Dispossessed', 'Tehanu']);

    const taken = await works({ remove: ['OL59796W'] });
    expect(taken.body.lists[0].works).toHaveLength(1);
    expect(taken.body.counts[id]).toBe(1);

    expect(
      (await works({ add: [{ workKey: 'nope', title: 'x' }] })).status,
    ).toBe(400);
    expect(
      (
        await api('/lists/000000000000000000000000/works', {
          method: 'PATCH',
          cookie,
          body: { add: [work('OL1W', 'A')] },
        })
      ).status,
    ).toBe(404);
  });

  it('lets other readers find and open a public list, never a private one', async () => {
    const owner = await signUp();
    const reader = await signUp();
    const make = async (name: string, open?: boolean) =>
      (
        await api('/lists', {
          method: 'POST',
          cookie: owner.cookie,
          body: { name, public: open },
        })
      ).body.list.id as string;
    // Public unless said otherwise
    const open = await make('Winter classics', false);
    await make('Winter secrets', false);
    await api('/books', {
      method: 'POST',
      cookie: owner.cookie,
      body: {
        title: 'The Left Hand of Darkness',
        authors: ['Ursula K. Le Guin'],
        lists: [open],
        openLibrary: { work: 'OL59861W' },
        copy: { status: 'shelf' },
      },
    });
    await api(`/lists/${open}/works`, {
      method: 'PATCH',
      cookie: owner.cookie,
      body: { add: [work('OL59796W', 'Tehanu')] },
    });
    const made = await api(`/lists/${open}`, {
      method: 'PATCH',
      cookie: owner.cookie,
      body: { public: true },
    });
    expect(made.body.lists[0]).toMatchObject({
      name: 'Winter classics',
      public: true,
    });

    const found = await api('/lists/shared?q=winter', {
      cookie: reader.cookie,
    });
    expect(found.body.lists).toHaveLength(1);
    expect(found.body.lists[0]).toMatchObject({ id: open, books: 2 });
    // Never one's own
    expect(
      (await api('/lists/shared?q=winter', { cookie: owner.cookie })).body
        .lists,
    ).toHaveLength(0);

    const shown = await api(`/lists/shared/${open}`, { cookie: reader.cookie });
    expect(
      shown.body.list.works.map((w: { title: string }) => w.title),
    ).toEqual(['The Left Hand of Darkness', 'Tehanu']);
    // Nothing of the owner's copy goes out
    expect(Object.keys(shown.body.list.works[0]).sort()).toEqual(
      ['authors', 'editionCount', 'title', 'workKey'].sort(),
    );

    await api(`/lists/${open}`, {
      method: 'PATCH',
      cookie: owner.cookie,
      body: { public: false },
    });
    expect(
      (await api(`/lists/shared/${open}`, { cookie: reader.cookie })).status,
    ).toBe(404);
    expect(
      (
        await api(`/lists/${open}`, {
          method: 'PATCH',
          cookie: owner.cookie,
          body: {},
        })
      ).status,
    ).toBe(400);
  });

  it('keeps other readers’ lists to come back to', async () => {
    const { cookie } = await signUp();
    const keep = (body: unknown) =>
      api('/lists/saved', { method: 'PUT', cookie, body });
    const pile = [work('OL59800W', 'The Dispossessed')];

    await keep({
      kind: 'readers',
      ref: 'ann/OL1L',
      name: 'Booker winners',
      books: 48,
      works: pile,
    });
    const kept = await keep({
      kind: 'shared',
      ref: '0123456789abcdef01234567',
      name: 'Winter classics',
      books: 2,
      works: [{ ...pile[0], workKey: 'book-0123456789abcdef01234567' }],
    });
    // The last kept first
    expect(kept.body.saved.map((l: { name: string }) => l.name)).toEqual([
      'Winter classics',
      'Booker winners',
    ]);
    expect(
      (
        await keep({
          kind: 'readers',
          ref: '../x',
          name: 'x',
          books: 1,
          works: [],
        })
      ).status,
    ).toBe(400);

    const gone = await api('/lists/saved?kind=readers&ref=ann/OL1L', {
      method: 'DELETE',
      cookie,
    });
    expect(gone.body.saved).toHaveLength(1);
    // Its own lists untouched
    expect((await api('/lists', { cookie })).body.lists).toEqual([]);
  });
});
