import { describe, expect, it } from 'vitest';
import type { Book } from '@/entities/book/types';
import { byArrival, byMonth, cameOn, finishedOn } from './growth';
import { byDecade, extremes, figures } from './libraryStats';
import { tally } from '@/entities/book/tallies';

let made = 0;
const book = (fields: Partial<Book> = {}): Book => ({
  id: `b${made++}`,
  title: 'A book',
  authors: [],
  createdAt: '2026-03-04T10:00:00.000Z',
  updatedAt: '2026-03-04T10:00:00.000Z',
  ...fields,
});

describe('library stats', () => {
  it('counts books, pages and the people who wrote them', () => {
    const found = figures([
      book({ pages: 100, authors: ['Woolf'] }),
      book({ pages: 300, authors: ['Woolf', 'Bell'] }),
      book(),
    ]);
    expect(found).toMatchObject({ books: 3, pages: 400, authors: 2 });
    expect(found.height).toBeGreaterThan(0);
  });

  it('tallies the commonest first, a book counted once for each', () => {
    const genres = tally(
      [
        book({ genres: ['Poetry', 'Poetry'] }),
        book({ genres: ['Fantasy'] }),
        book({ genres: ['Fantasy', 'Poetry'] }),
        book({ genres: ['Fantasy'] }),
      ],
      (b) => b.genres ?? [],
    );
    expect(genres.map((g) => [g.name, g.books.length])).toEqual([
      ['Fantasy', 3],
      ['Poetry', 2],
    ]);
  });

  it('draws every decade between, folding long empty runs', () => {
    const decades = byDecade([
      book({ firstPublishedYear: 1813 }),
      book({ firstPublishedYear: 1925 }),
      book({ publishedYear: 2021 }),
      book({ firstPublishedYear: 2024 }),
      book(),
    ])!;
    // 1820–1910 and 1930–2010 have nothing, each folded into one break
    expect(
      decades.columns.map(({ from, to, books }) => [from, to, books.length]),
    ).toEqual([
      [1810, undefined, 1],
      [1820, 1910, 0],
      [1920, undefined, 1],
      [1930, 2010, 0],
      [2020, undefined, 2],
    ]);
    expect(decades.oldest.firstPublishedYear).toBe(1813);
    expect(decades.newest.firstPublishedYear).toBe(2024);
  });

  it('gathers the oldest once there are too many decades to draw', () => {
    const every = Array.from({ length: 20 }, (_, i) =>
      book({ firstPublishedYear: 1830 + i * 10 }),
    );
    const decades = byDecade(every)!;
    expect(decades.columns).toHaveLength(14);
    expect(decades.columns[0]).toMatchObject({ older: true, from: 1890 });
    expect(decades.columns[0].books).toHaveLength(7);
  });

  it('finds the thickest and slimmest among the paged, and piles them by length', () => {
    const found = extremes([
      book({ pages: 64, title: 'Slim' }),
      book({ pages: 1079, title: 'Thick' }),
      book({ pages: 200 }),
      book(),
    ])!;
    expect(found.longest.title).toBe('Thick');
    expect(found.shortest.title).toBe('Slim');
    expect(found).toMatchObject({ average: 448 });
    // A hundred pages each, the slimmest's to the doorstop's, 800 and on as one
    expect(
      found.piles.map((pile) => [pile.from, pile.more, pile.books.length]),
    ).toEqual([
      [0, false, 1],
      [100, false, 0],
      [200, false, 1],
      [300, false, 0],
      [400, false, 0],
      [500, false, 0],
      [600, false, 0],
      [700, false, 0],
      [800, true, 1],
    ]);
    expect(extremes([book({ pages: 10 })])).toBeNull();
  });

  it('counts by month only the days the reader gave', () => {
    const months = byMonth(
      [
        book(),
        book({ copy: { status: 'shelf', acquired: { date: '2026-07-20' } } }),
        book({ copy: { status: 'shelf', acquired: { date: '2025-01-02' } } }),
      ],
      2026,
      cameOn,
    );
    expect(months.map((m) => m.length)).toEqual([
      0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0,
    ]);
  });

  it('groups the books by how they came, own words as another way', () => {
    const came = (how?: string) =>
      book({ copy: { status: 'shelf', acquired: { how } } });
    const found = byArrival([
      came('gift'),
      came('bought'),
      came('gift'),
      came('Won it in a raffle'),
      came(),
    ]);
    expect(found.rows.map((row) => [row.name, row.books.length])).toEqual([
      ['A gift', 2],
      ['Bought', 1],
      ['Other', 1],
    ]);
    expect(found.told).toBe(4);
  });

  it('counts a book finished only once it has been read', () => {
    const shelf = { status: 'shelf' as const, finished: '2026-03-02' };
    expect(finishedOn(book({ copy: { ...shelf, reading: 'read' } }))).toEqual({
      year: 2026,
      month: 2,
    });
    expect(finishedOn(book({ copy: { ...shelf, reading: 'reading' } }))).toBe(
      null,
    );
  });
});
