import { describe, expect, it } from 'vitest';
import { parseDay } from './dates';

describe('parseDay', () => {
  it('reads a day typed the British way, in words or figures', () => {
    expect(parseDay('25 December 2019')).toBe('2019-12-25');
    expect(parseDay('25 dec 2019')).toBe('2019-12-25');
    expect(parseDay('25th Dec, 2019')).toBe('2019-12-25');
    expect(parseDay('December 25, 2019')).toBe('2019-12-25');
    expect(parseDay('25/12/2019')).toBe('2019-12-25');
    expect(parseDay('5.3.2021')).toBe('2021-03-05');
    expect(parseDay('2019-12-25')).toBe('2019-12-25');
  });

  it('takes two figures for a year in this century unless still to come', () => {
    expect(parseDay('25/12/19')).toBe('2019-12-25');
    expect(parseDay('1/1/99')).toBe('1999-01-01');
  });

  it('turns away what isn’t a day', () => {
    expect(parseDay('31/04/2020')).toBeNull();
    expect(parseDay('12/25/2019')).toBeNull();
    expect(parseDay('sometime in spring')).toBeNull();
    expect(parseDay('')).toBeNull();
  });
});
