import { describe, expect, it } from 'vitest';
import { readableTitle } from '../src/lib/romanized.js';

describe('Russian put in Latin letters the library way', () => {
  it('is put back in Cyrillic, by its marks or its language', () => {
    expect(readableTitle('Zolushka beremennai͡a')).toBe('Золушка беременная');
    expect(readableTitle('Kniga mërtvykh', ['rus'])).toBe('Книга мёртвых');
    expect(readableTitle('Istorii͡a ego slugi')).toBe('История его слуги');
    expect(readableTitle('Konʹi͡ak "Napoleon"')).toBe('Коньяк "Наполеон"');
    expect(readableTitle('Inostranet͡s v smutnoe vremi͡a')).toBe(
      'Иностранец в смутное время',
    );
    expect(readableTitle('Kak my stroili budushchee Rossii', ['rus'])).toBe(
      'Как мы строили будущее России',
    );
    expect(readableTitle('Dist͡siplinarnyĭ sanatoriĭ')).toBe(
      'Дисциплинарный санаторий',
    );
  });

  it('reads the tie as Open Library writes it, in two halves', () => {
    // As the catalogue sends them: each half of a tie over its own letter,
    // a breve apart from its letter
    expect(
      readableTitle(
        'Dist\u0361\ufe20s\ufe21iplinarnyi\u0306 sanatorii\u0306'.replace(
          '\u0361',
          '',
        ),
      ),
    ).toBe('Дисциплинарный санаторий');
    expect(
      readableTitle('Inostranet\ufe20s\ufe21 v smutnoe vremi\ufe20a\ufe21'),
    ).toBe('Иностранец в смутное время');
    // й with a caron, a soft sign as an apostrophe, a name with Ė
    const c = (code: number) => String.fromCodePoint(code);
    expect(
      readableTitle(
        `Dist${c(0xfe20)}s${c(0xfe21)}iplinarny${c(0x1d0)} sanatori${c(0x1d0)}`,
      ),
    ).toBe('Дисциплинарный санаторий');
    expect(readableTitle("Smert' v avtozeke", ['rus'])).toBe(
      'Смерть в автозеке',
    );
    expect(readableTitle(`${c(0x116)}duard Limonov`)).toBe('Эдуард Лимонов');
    // The old spelling's і
    expect(
      readableTitle(
        `Polnoe sobrani${c(0x304)}e sochineni${c(0x304)}i${c(0x306)}`,
      ),
    ).toBe('Полное собраніе сочиненій');
    expect(readableTitle('Prichudlivye avanti\ufe20u\ufe21ry Zhozho')).toBe(
      'Причудливые авантюры Жожо',
    );
  });

  it('leaves alone what isn’t', () => {
    expect(readableTitle('Des incidents ordinaires', ['fre'])).toBe(
      'Des incidents ordinaires',
    );
    expect(readableTitle('The Queue', ['eng', 'rus'])).toBe('The Queue');
    expect(readableTitle('День опричника', ['rus'])).toBe('День опричника');
    expect(readableTitle('Бойня номер пять')).toBe('Бойня номер пять');
  });
});
