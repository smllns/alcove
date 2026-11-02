import { describe, expect, it } from 'vitest';
import { nativeName } from './languages';

describe('language names', () => {
  it('names a language in itself, from the library’s codes too', () => {
    expect(nativeName('ger')).toBe('Deutsch');
    expect(nativeName('fre')).toBe('Français');
    expect(nativeName('rus')).toBe('Русский');
  });

  it('falls back to English for one the browser can’t name in itself', () => {
    expect(nativeName('lat')).toBe('Latin');
  });
});
