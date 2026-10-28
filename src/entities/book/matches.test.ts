import { describe, expect, it } from 'vitest';
import { bookMatches } from './matches';
import type { Book } from './types';

const book = (fields: Partial<Book>) =>
  ({ id: '1', title: '', authors: [], ...fields }) as Book;

describe('finding a book among the reader’s own', () => {
  const secret = book({
    title: 'The Secret History',
    authors: ['Donna Tartt'],
  });

  it('finds it by every word, in any order, in title or author', () => {
    expect(bookMatches(secret, 'tartt secret')).toBe(true);
    expect(bookMatches(secret, 'secret goldfinch')).toBe(false);
  });

  it('pays no mind to capitals or accents', () => {
    expect(
      bookMatches(
        book({
          title: 'Le Petit Prince',
          authors: ['Antoine de Saint-Exupéry'],
        }),
        'EXUPERY',
      ),
    ).toBe(true);
    expect(bookMatches(book({ title: 'Ёжик в тумане' }), 'ежик')).toBe(true);
  });

  it('keeps й a letter of its own', () => {
    expect(bookMatches(book({ title: 'Мой дом' }), 'мои')).toBe(false);
  });

  it('looks in the series and the ISBN too', () => {
    const earthsea = book({
      title: 'Tehanu',
      series: { name: 'Earthsea' },
      isbn: '9780689315954',
    } as Partial<Book>);
    expect(bookMatches(earthsea, 'earthsea')).toBe(true);
    expect(bookMatches(earthsea, '9780689315954')).toBe(true);
  });
});
