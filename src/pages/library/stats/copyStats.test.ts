import { describe, expect, it } from 'vitest';
import type { Book, CopyCondition } from '@/entities/book/types';
import { byCondition, publishers } from './copyStats';

let made = 0;
const book = (fields: Partial<Book> = {}): Book => ({
  id: `c${made++}`,
  title: 'A book',
  authors: [],
  createdAt: '2026-03-04T10:00:00.000Z',
  updatedAt: '2026-03-04T10:00:00.000Z',
  ...fields,
});

describe('copy stats', () => {
  it('keeps the shapes best first, leaving out those with no books', () => {
    const kept = (condition?: CopyCondition) =>
      book({ copy: { status: 'shelf', condition } });
    const found = byCondition([
      kept('worn'),
      kept('new'),
      kept('worn'),
      kept(),
    ]);
    expect(found.rows.map((row) => [row.name, row.books.length])).toEqual([
      ['Like new', 1],
      ['Well-read', 2],
    ]);
    expect(found.told).toBe(3);
  });

  it('counts a publisher written differently as one', () => {
    const found = publishers([
      book({ publisher: 'Penguin Books' }),
      book({ publisher: 'penguin  books ' }),
      book({ publisher: 'Vintage' }),
      book(),
    ]);
    expect(found.map((row) => [row.name, row.books.length])).toEqual([
      ['Penguin Books', 2],
      ['Vintage', 1],
    ]);
  });
});
