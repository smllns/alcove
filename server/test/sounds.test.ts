import { describe, expect, it } from 'vitest';
import { soundsSame, spellings } from '../src/lib/sounds.js';

describe('a name as it sounds', () => {
  it('is one writer in Cyrillic and in the catalogue’s Latin letters', () => {
    expect(soundsSame('Рафаэль Боб-Ваксберг', 'Raphael Bob-Waksberg')).toBe(
      true,
    );
    expect(soundsSame('Боб-Ваксберг, Рафаэль', 'Raphael Bob-Waksberg')).toBe(
      true,
    );
    expect(soundsSame('Рафаэль Боб-Ваксберг', 'Arkady Vaksberg')).toBe(false);
    expect(soundsSame('Рафаэль Боб-Ваксберг', 'Joseph Waksberg')).toBe(false);
  });

  it('is looked for by the ways a surname may be spelled in Latin letters', () => {
    expect(spellings('Ваксберг')).toEqual([
      'vaksberg',
      'waksberg',
      'vaxberg',
      'waxberg',
    ]);
  });
});
