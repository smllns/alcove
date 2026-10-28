import { describe, expect, it } from 'vitest';
import { api, signUp } from './api.js';

// A home with one room, one bookcase and two shelves, as the browser sends
// it the first time: with temporary ids
const tree = {
  homes: [
    {
      id: 'tmp-h',
      name: 'Flat',
      rooms: [
        {
          id: 'tmp-r',
          name: 'Study',
          units: [
            {
              id: 'tmp-u',
              name: 'Tall bookcase',
              shelves: [
                { id: 'tmp-s1', name: 'Top' },
                { id: 'tmp-s2', name: 'Bottom' },
              ],
            },
          ],
        },
      ],
    },
  ],
};

describe('places', () => {
  it('saves the tree, giving the new places ids of their own', async () => {
    const { cookie } = await signUp();
    const saved = await api('/places', { method: 'PUT', cookie, body: tree });
    expect(saved.status).toBe(200);
    const home = saved.body.homes[0];
    expect(home.id).not.toBe('tmp-h');
    expect(saved.body.created['tmp-s1']).toBe(
      home.rooms[0].units[0].shelves[0].id,
    );
    expect((await api('/places', { cookie })).body.homes).toEqual(
      saved.body.homes,
    );
  });

  it('counts the books in each place', async () => {
    const { cookie } = await signUp();
    const { homes } = (
      await api('/places', { method: 'PUT', cookie, body: tree })
    ).body;
    const [home] = homes;
    const unit = home.rooms[0].units[0];
    const place = {
      home: home.id,
      room: home.rooms[0].id,
      unit: unit.id,
      shelf: unit.shelves[0].id,
    };
    for (const title of ['Middlemarch', 'Persuasion'])
      await api('/books', {
        method: 'POST',
        cookie,
        body: { title, authors: ['?'], copy: { status: 'shelf', place } },
      });
    const { counts } = (await api('/places', { cookie })).body;
    expect(counts[unit.shelves[0].id]).toBe(2);
    expect(counts[home.id]).toBe(2);
  });

  it('moves a removed shelf’s books up into its bookcase', async () => {
    const { cookie } = await signUp();
    const { homes } = (
      await api('/places', { method: 'PUT', cookie, body: tree })
    ).body;
    const [home] = homes;
    const unit = home.rooms[0].units[0];
    const place = {
      home: home.id,
      room: home.rooms[0].id,
      unit: unit.id,
      shelf: unit.shelves[1].id,
    };
    const added = await api('/books', {
      method: 'POST',
      cookie,
      body: {
        title: 'Emma',
        authors: ['Jane Austen'],
        copy: { status: 'shelf', place },
      },
    });

    const without = structuredClone(homes);
    without[0].rooms[0].units[0].shelves.pop();
    await api('/places', { method: 'PUT', cookie, body: { homes: without } });

    const { book } = (await api(`/books/${added.body.book.id}`, { cookie }))
      .body;
    expect(book.copy.place).toEqual({
      home: home.id,
      room: home.rooms[0].id,
      unit: unit.id,
    });
  });
});
