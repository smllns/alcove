import { describe, expect, it } from 'vitest';
import { sameWriter } from './writers';

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
