import { describe, expect, it } from 'vitest';
import type { Book } from '@/entities/book/types';
import { byMonth, cameOn, finishedOn } from './growth';
import { authors, byDecade, extremes, figures, tally } from './libraryStats';

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

  it('draws every decade between, gathering the oldest of a long span', () => {
    const decades = byDecade([
      book({ firstPublishedYear: 1813 }),
      book({ firstPublishedYear: 1925 }),
      book({ publishedYear: 2021 }),
      book({ firstPublishedYear: 2024 }),
      book(),
    ])!;
    expect(decades.columns[0]).toMatchObject({ older: true, from: 1880 });
    expect(decades.columns[0].books).toHaveLength(1);
    expect(decades.columns.at(-1)).toMatchObject({ from: 2020 });
    expect(decades.columns.at(-1)!.books).toHaveLength(2);
    expect(decades.columns).toHaveLength(15);
    expect(decades.oldest.firstPublishedYear).toBe(1813);
    expect(decades.newest.firstPublishedYear).toBe(2024);
  });

  it('finds the thickest and slimmest among the paged', () => {
    const found = extremes([
      book({ pages: 64, title: 'Slim' }),
      book({ pages: 1079, title: 'Thick' }),
      book({ pages: 200 }),
      book(),
    ])!;
    expect(found.longest.title).toBe('Thick');
    expect(found.shortest.title).toBe('Slim');
    expect(found).toMatchObject({ average: 448, counted: 3 });
    expect(extremes([book({ pages: 10 })])).toBeNull();
  });

  it('ranks authors by how many books, the better rated first', () => {
    const rated = (rating: number) => ({ status: 'shelf' as const, rating });
    const found = authors([
      book({ authors: ['Low'], copy: rated(2) }),
      book({ authors: ['Low'] }),
      book({ authors: ['High'], copy: rated(5) }),
      book({ authors: ['High'] }),
      book({ authors: ['Once'] }),
    ]);
    expect(found.map((a) => a.name)).toEqual(['High', 'Low', 'Once']);
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
