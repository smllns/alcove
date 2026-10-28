import { describe, expect, it } from 'vitest';
import { counted, plural } from './plural';

describe('words for how many', () => {
  it('takes an s, or the plural given, for any number but one', () => {
    expect(plural(1, 'book')).toBe('book');
    expect(plural(0, 'book')).toBe('books');
    expect(plural(2, 'shelf', 'shelves')).toBe('shelves');
  });

  it('puts the number in front, written out in full', () => {
    expect(counted(1214, 'book')).toBe('1,214 books');
  });
});
