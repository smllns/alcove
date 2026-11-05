import { describe, expect, it } from 'vitest';
import { csvRecords, parseCsv } from './csv';

describe('parseCsv', () => {
  it('reads quoted cells with commas, quotes and line breaks', () => {
    const text =
      'Title,Review\r\n"Dune, Book One","Sand.\nSo much ""sand""."\r\nEmma,\r\n';
    expect(parseCsv(text)).toEqual([
      ['Title', 'Review'],
      ['Dune, Book One', 'Sand.\nSo much "sand".'],
      ['Emma', ''],
    ]);
  });

  it('names each row’s cells by the first row, past a byte-order mark', () => {
    expect(csvRecords('\uFEFFTitle,Pages\nEmma,474')).toEqual([
      { Title: 'Emma', Pages: '474' },
    ]);
  });
});
