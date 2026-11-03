import { describe, expect, it } from 'vitest';
import type { Book } from '@/entities/book/types';
import { byReading, byStars, byWay } from './readingStats';

let made = 0;
const book = (copy: Book['copy'] = { status: 'shelf' }): Book => ({
  id: `r${made++}`,
  title: `Book ${made}`,
  authors: [],
  createdAt: '2026-03-04T10:00:00.000Z',
  updatedAt: '2026-03-04T10:00:00.000Z',
  copy,
});

const counts = (rows: { name: string; books: Book[] }[]) =>
  rows.map((row) => [row.name, row.books.length]);

describe('reading stats', () => {
  it('sorts books by reading, never said counting as not yet read', () => {
    const old = book({ status: 'shelf', acquired: { date: '2019-05-01' } });
    const found = byReading([
      book({ status: 'shelf', reading: 'read' }),
      book({ status: 'shelf', reading: 'reading' }),
      book({ status: 'shelf', acquired: { date: '2024-01-01' } }),
      old,
      book({ status: 'shelf', reading: 'unread', nonPhysical: 'ebook' }),
    ]);
    expect(counts(found.rows)).toEqual([
      ['Read', 1],
      ['Reading now', 1],
      ['Not yet read', 3],
    ]);
    expect(found.waiting).toBe(old);
    // Only the books on the shelves stand in the stack
    expect(found.height).toBeGreaterThan(0);
  });

  it('counts a half star with the whole stars under it', () => {
    const rated = (rating: number) => book({ status: 'shelf', rating });
    const found = byStars([
      rated(5),
      rated(4.5),
      rated(4),
      rated(0.5),
      book(),
    ])!;
    expect(counts(found.rows)).toEqual([
      ['★★★★★', 1],
      ['★★★★☆', 2],
      ['★☆☆☆☆', 1],
    ]);
    expect(found).toMatchObject({ average: 3.5, five: 1 });
    expect(byStars([book()])).toBeNull();
  });

  it('tells the books on the shelves from those read another way', () => {
    const rows = byWay([
      book(),
      book(),
      book({ status: 'shelf', nonPhysical: 'audiobook' }),
    ]);
    expect(counts(rows)).toEqual([
      ['On your shelves', 2],
      ['Audiobook', 1],
    ]);
  });
});
