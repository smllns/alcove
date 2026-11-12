import { describe, expect, it } from 'vitest';
import { sameWriter, knowSameWriters } from './writers';

describe('one writer however written', () => {
  it('matches names across alphabets and spellings', () => {
    expect(
      sameWriter(
        'Леопольд фон Захер-Мазох',
        'Leopold Ritter von Sacher-Masoch',
      ),
    ).toBe(true);
    expect(sameWriter('Антон Чехов', 'Anton Chekhov')).toBe(true);
    expect(sameWriter('Ирвин Уэлш', 'Irvine Welsh')).toBe(true);
    expect(sameWriter('Йоав Блум', 'Yoav Blum')).toBe(true);
    expect(sameWriter('Лев Толстой', 'Aleksey Tolstoy')).toBe(false);
  });
});

describe('writers known to be one', () => {
  it('are one however unlike their names sound, once known so', () => {
    expect(sameWriter('Annie Ernaux', 'Анни Эрно')).toBe(false);
    knowSameWriters([['Annie Ernaux', 'Анни Эрно']]);
    expect(sameWriter('Annie Ernaux', 'Анни Эрно')).toBe(true);
    // And every other way of writing either
    expect(sameWriter('Ernaux, Annie', 'Анни Эрно')).toBe(true);
    knowSameWriters([]);
    expect(sameWriter('Annie Ernaux', 'Анни Эрно')).toBe(false);
  });
});
