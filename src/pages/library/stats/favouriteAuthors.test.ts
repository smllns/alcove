import { describe, expect, it } from 'vitest';
import type { Book } from '@/entities/book/types';
import { authors } from './favouriteAuthors';

let made = 0;
const book = (fields: Partial<Book> = {}): Book => ({
  id: `a${made++}`,
  title: 'A book',
  authors: [],
  createdAt: '2026-03-04T10:00:00.000Z',
  updatedAt: '2026-03-04T10:00:00.000Z',
  ...fields,
});

describe('favourite authors', () => {
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

  it('counts an author however their name is written', () => {
    const by = (...names: string[]) =>
      names.map((name) => book({ authors: [name] }));
    const found = authors([
      ...by(
        'Фёдор Достоевский',
        'Fyodor Dostoevsky',
        'Достоевский, Фёдор Михайлович',
      ),
      ...by('Fyodor Dostoyevsky', 'Лев Толстой', 'Leo Tolstoy'),
      ...by(
        'J.R.R. Tolkien',
        'J. R. R. Tolkien',
        'Kurt Vonnegut Jr.',
        'Kurt Vonnegut',
      ),
      ...by('Алексей Толстой', 'Харуки Мураками', 'Haruki Murakami'),
    ]);
    expect(found.map((a) => [a.name, a.books.length])).toEqual([
      ['Фёдор Достоевский', 4],
      ['Лев Толстой', 2],
      ['J.R.R. Tolkien', 2],
      ['Kurt Vonnegut', 2],
      ['Харуки Мураками', 2],
      ['Алексей Толстой', 1],
    ]);
  });
});
