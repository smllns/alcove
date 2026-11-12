import { describe, expect, it } from 'vitest';
import { api, signUp } from './api.js';
import { stubOpenLibrary, stubWikimedia } from './sites.js';

// Open Library knows the book and its writer, with their item on Wikidata;
// Wikidata knows their names in other languages
stubOpenLibrary((url) => {
  if (url.pathname === '/works/OL900W.json')
    return Response.json({
      title: 'La place',
      authors: [{ author: { key: '/authors/OL900A' } }],
    });
  if (url.pathname === '/authors/OL900A.json')
    return Response.json({
      name: 'Annie Ernaux',
      bio: 'A French writer.',
      photos: [1],
      birth_date: '1940',
      remote_ids: { wikidata: 'Q900900' },
    });
  return undefined;
});
stubWikimedia((url) => {
  if (url.searchParams.get('action') !== 'wbgetentities') return undefined;
  return Response.json({
    entities: {
      Q900900: {
        labels: {
          en: { value: 'Annie Ernaux' },
          ru: { value: 'Анни Эрно' },
          fr: { value: 'Annie Ernaux' },
        },
        aliases: { en: [{ value: 'Annie Duchesne' }] },
        claims: {},
      },
    },
  });
});

describe('a writer found', () => {
  it('is known by every name Wikidata gives them, for all readers', async () => {
    const me = await signUp();
    const found = await api(
      `/lookup/works/OL900W/author?${new URLSearchParams({ title: 'Свое место', name: 'Анни Эрно', read: 'ru' })}`,
      { cookie: me.cookie },
    );
    expect(found.body.author).toMatchObject({ item: 'Q900900' });
    // Names newly known, said so; found again, nothing more to know
    expect(found.body.moreNames).toBe(true);
    const again = await api(
      `/lookup/works/OL900W/author?${new URLSearchParams({ title: 'Свое место', name: 'Анни Эрно', read: 'ru' })}`,
      { cookie: me.cookie },
    );
    expect(again.body.moreNames).toBe(false);
    const { groups } = (
      await api(
        `/lookup/writers/same?${new URLSearchParams({ names: 'Annie Ernaux\nАнни Эрно' })}`,
        { cookie: me.cookie },
      )
    ).body as { groups: string[][] };
    expect(groups).toHaveLength(1);
    expect(groups[0]).toEqual(
      expect.arrayContaining(['Annie Ernaux', 'Анни Эрно', 'Annie Duchesne']),
    );
  });
});
