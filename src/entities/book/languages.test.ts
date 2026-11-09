import { describe, expect, it } from 'vitest';
import { languageName } from './languages';

describe('language names', () => {
  it('names a language in English, from the library’s codes too', () => {
    expect(languageName('ger')).toBe('German');
    expect(languageName('fre')).toBe('French');
    expect(languageName('rus')).toBe('Russian');
  });
});
