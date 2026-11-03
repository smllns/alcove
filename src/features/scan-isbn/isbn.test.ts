import { describe, expect, it } from 'vitest';
import { isbnFrom } from './isbn';

describe('isbnFrom', () => {
  it('takes a book’s barcode whose last figure checks', () => {
    expect(isbnFrom('9780141439518')).toBe('9780141439518');
    expect(isbnFrom('9791032305690')).toBe('9791032305690');
  });

  it('turns away a wrong check figure, a short code and another product', () => {
    expect(isbnFrom('9780141439519')).toBeNull();
    expect(isbnFrom('978014143951')).toBeNull();
    expect(isbnFrom('5012345678900')).toBeNull();
  });
});
