import { describe, expect, it } from 'vitest';
import { api, signUp } from './api.js';
import { stubOpenLibrary, stubWikimedia } from './sites.js';

// A writer's books as Open Library finds them, the most read first: theirs,
// a box set, one by someone else they're second on, a translation kept as
// a work of its own (naming its translator, printed once), one with no
// year, and their best-known again under a longer title
const doc = (key: string, title: string, fields: object = {}) => ({
  key: `/works/${key}`,
  title,
  author_name: ['Kurt Vonnegut'],
  author_key: ['OL1A'],
  first_publish_year: 1963,
  edition_count: 9,
  ...fields,
});
stubOpenLibrary((url) =>
  url.pathname === '/works/OL50W.json'
    ? Response.json({
        title: 'Колыбель для кошки',
        authors: [{ author: { key: '/authors/OL50A' } }],
      })
    : url.pathname === '/authors/OL50A.json'
      ? Response.json({ name: 'kurt vonnegut' })
      : url.pathname === '/search/authors.json'
        ? Response.json({
            docs: [
              {
                key: '/authors/OL7A',
                name: 'Kurt Vonnegut Society',
                work_count: 1,
              },
              { key: '/authors/OL1A', name: 'Kurt Vonnegut', work_count: 90 },
            ],
          })
        : url.pathname === '/search.json' &&
            url.searchParams.get('author_key') === 'OL1A'
          ? Response.json({
              docs: [
                doc('OL1W', 'Cat’s Cradle'),
                doc('OL2W', 'Vonnegut Box Set', { first_publish_year: 2000 }),
                doc('OL3W', 'Their Book', { author_key: ['OL9A', 'OL1A'] }),
                doc('OL4W', 'Колыбель для кошки', {
                  author_key: ['OL1A', 'OL8A'],
                  edition_count: 1,
                }),
                doc('OL5W', 'Unknown Year', { first_publish_year: null }),
                doc('OL6W', 'Cat’s Cradle: A Novel'),
                doc('OL7W', 'Бойня номер пять', { first_publish_year: 1969 }),
              ],
            })
          : undefined,
);

// Wikiquote has their page: quotes of their own, and some about them.
// The Russian Wikipedia knows them by their name in Russian, with an
// English article, which Wikidata gives their years and English name for.
stubWikimedia((url) => {
  const q = url.searchParams;
  if (url.hostname === 'ru.wikipedia.org' && q.get('generator') === 'search')
    return Response.json({
      query: {
        pages: [
          {
            title: 'Воннегут, Курт',
            index: 1,
            langlinks: [{ title: 'Kurt Vonnegut' }],
          },
        ],
      },
    });
  if (url.hostname.endsWith('wikipedia.org') && q.get('generator'))
    return Response.json({ query: { pages: [] } });
  if (url.pathname.endsWith('/page/summary/Kurt_Vonnegut'))
    return Response.json({
      type: 'standard',
      extract: 'An American writer.',
      content_urls: { desktop: { page: 'https://en.wikipedia.org/k' } },
      wikibase_item: 'Q49081',
    });
  if (url.hostname === 'www.wikidata.org') {
    const time = (year: number) => [
      {
        mainsnak: {
          datavalue: { value: { time: `+${year}-01-01T00:00:00Z` } },
        },
      },
    ];
    // A film and a book called the same; the book by someone (P50)
    if (q.get('action') === 'wbsearchentities')
      return Response.json({
        search:
          q.get('search') === 'День опричника'
            ? [{ id: 'Q1' }, { id: 'Q2' }]
            : [],
      });
    const by = [{ mainsnak: { datavalue: { value: { id: 'Q3' } } } }];
    const all = {
      Q49081: {
        labels: { en: { value: 'Kurt Vonnegut' } },
        claims: { P569: time(1922), P570: time(2007) },
      },
      Q1: {
        labels: {
          ru: { value: 'День опричника' },
          en: { value: 'Day of the Oprichnik (film)' },
        },
      },
      Q2: {
        labels: {
          ru: { value: 'День опричника' },
          en: { value: 'Day of the Oprichnik' },
        },
        aliases: { de: [{ value: 'Der Tag des Opritschniks' }] },
        claims: { P50: by },
      },
    };
    const ids = (q.get('ids') ?? '').split('|');
    return Response.json({
      entities: Object.fromEntries(
        Object.entries(all).filter(([id]) => ids.includes(id)),
      ),
    });
  }
  if (q.get('list') === 'search')
    return Response.json({ query: { search: [{ title: 'Kurt Vonnegut' }] } });
  if (q.get('action') === 'parse')
    return Response.json({
      parse: {
        wikitext: [
          '== Quotes ==',
          '* We are what we pretend to be, so we must be careful about what we pretend to be.',
          '** Mother Night (1961)',
          '== Quotes about Vonnegut ==',
          '* He was a great writer, said somebody else entirely.',
        ].join('\n'),
      },
    });
  return undefined;
});

describe('a writer’s page', () => {
  it('finds their own books, each once', async () => {
    const { cookie } = await signUp();
    const res = await api('/lookup/authors/OL1A/works', { cookie });
    expect(res.status).toBe(200);
    expect(res.body.works.map((w: { title: string }) => w.title)).toEqual([
      'Cat’s Cradle',
      'Бойня номер пять',
    ]);
    const bad = await api('/lookup/authors/nobody/works', { cookie });
    expect(bad.status).toBe(400);
  });

  it('counts a book the reader said is theirs under another title', async () => {
    const { cookie } = await signUp();
    const added = await api('/books', {
      method: 'POST',
      cookie,
      body: {
        title: 'Бойня номер пять',
        authors: ['Курт Воннегут'],
        openLibrary: { also: ['OL7W'] },
        copy: { status: 'shelf', rating: 5 },
      },
    });
    expect(added.status).toBe(201);
    const res = await api('/lookup/authors/OL1A/works', { cookie });
    const said = res.body.works.find(
      (w: { workKey: string }) => w.workKey === 'OL7W',
    );
    expect(said).toMatchObject({ bookId: added.body.book.id, rating: 5 });
  });

  it('finds one put in in Russian in the catalogue by their English name', async () => {
    const { cookie } = await signUp();
    const res = await api(
      `/lookup/writer?${new URLSearchParams({ name: 'Курт Воннегут', title: 'Колыбель для кошки', read: 'ru' })}`,
      { cookie },
    );
    expect(res.body.author).toMatchObject({
      key: 'OL1A',
      name: 'Kurt Vonnegut',
      born: 1922,
      died: 2007,
      bio: 'An American writer.',
    });
  });

  it('looks past a bare record in the catalogue to the writer', async () => {
    const { cookie } = await signUp();
    const res = await api(
      `/lookup/works/OL50W/author?${new URLSearchParams({ name: 'Курт Воннегут', title: 'Колыбель для кошки', read: 'ru' })}`,
      { cookie },
    );
    expect(res.body.author).toMatchObject({
      key: 'OL1A',
      name: 'Kurt Vonnegut',
      born: 1922,
      bio: 'An American writer.',
    });
  });

  it('finds a book’s titles in other languages, not a film’s', async () => {
    const { cookie } = await signUp();
    const res = await api(
      `/lookup/work-titles?${new URLSearchParams({ title: 'День опричника', original_title: 'День опричника', read: 'ru', original: 'ru' })}`,
      { cookie },
    );
    expect(res.body.titles).toEqual([
      'День опричника',
      'Day of the Oprichnik',
      'Der Tag des Opritschniks',
    ]);
  });

  it('finds words of their own, not about them', async () => {
    const { cookie } = await signUp();
    const res = await api('/lookup/writer/quotes?name=Kurt%20Vonnegut', {
      cookie,
    });
    expect(res.body).toEqual({
      quotes: [
        'We are what we pretend to be, so we must be careful about what we pretend to be.',
      ],
      source: 'https://en.wikiquote.org/wiki/Kurt_Vonnegut',
    });
  });
});
