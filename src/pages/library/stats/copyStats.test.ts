import { describe, expect, it } from 'vitest';
import type { Book, CopyCondition } from '@/entities/book/types';
import { byCondition } from './copyStats';
import { publishers } from './publishers';

let made = 0;
const book = (fields: Partial<Book> = {}): Book => ({
  id: `c${made++}`,
  title: 'A book',
  authors: [],
  createdAt: '2026-03-04T10:00:00.000Z',
  updatedAt: '2026-03-04T10:00:00.000Z',
  ...fields,
});

describe('copy stats', () => {
  it('keeps the shapes best first, leaving out those with no books', () => {
    const kept = (condition?: CopyCondition) =>
      book({ copy: { status: 'shelf', condition } });
    const found = byCondition([
      kept('worn'),
      kept('new'),
      kept('worn'),
      kept(),
    ]);
    expect(found.rows.map((row) => [row.name, row.books.length])).toEqual([
      ['Like new', 1],
      ['Well-read', 2],
    ]);
    expect(found.told).toBe(3);
  });

  it('counts a publisher written differently as one', () => {
    const found = publishers([
      book({ publisher: 'Penguin Books' }),
      book({ publisher: 'penguin  books ' }),
      book({ publisher: 'Vintage' }),
      book(),
    ]);
    expect(found.map((row) => [row.name, row.books.length])).toEqual([
      ['Penguin Books', 2],
      ['Vintage', 1],
    ]);
  });

  it('counts one publisher however its firm is written', () => {
    const found = publishers([
      book({ publisher: 'Harper Collins Publishers Ltd' }),
      book({ publisher: 'HarperCollins' }),
      book({ publisher: 'HarperCollins Publishers' }),
      book({ publisher: 'HarperCollins' }),
      book({ publisher: 'Издательство «Эксмо»' }),
      book({ publisher: 'ЭКСМО' }),
      book({ publisher: 'Penguin Press' }),
    ]);
    expect(found.map((row) => [row.name, row.books.length])).toEqual([
      ['HarperCollins', 4],
      ['ЭКСМО', 2],
      ['Penguin Press', 1],
    ]);
  });

  it('counts one publisher written in either alphabet, or misspelt', () => {
    const found = publishers([
      book({ publisher: 'Ад Маргинем' }),
      book({ publisher: 'Ad Marginem' }),
      book({ publisher: 'Ad Marginem' }),
      book({ publisher: 'Азбука-классика' }),
      book({ publisher: 'Азбука-класика' }),
      book({ publisher: 'AST' }),
      book({ publisher: 'ACT' }),
      book({ publisher: 'Arc' }),
      book({ publisher: 'Ark' }),
    ]);
    expect(found.map((row) => [row.name, row.books.length])).toEqual([
      ['Ad Marginem', 3],
      ['Азбука-классика', 2],
      ['AST', 2],
      ['Arc', 1],
      ['Ark', 1],
    ]);
  });

  it('counts an imprint with its publisher, when there', () => {
    const found = publishers([
      book({ publisher: 'Альпина' }),
      book({ publisher: 'Альпина.Проза' }),
      book({ publisher: 'Альпина. Проза' }),
      book({ publisher: 'Поляндрия' }),
      book({ publisher: 'Polyandria NoAge' }),
      book({ publisher: 'Новое литературное обозрение' }),
      book({ publisher: 'HarperCollins' }),
      book({ publisher: 'Harper Perennial' }),
      book({ publisher: 'HarperVia' }),
    ]);
    expect(found.map((row) => [row.name, row.books.length])).toEqual([
      ['Альпина', 3],
      ['HarperCollins', 3],
      ['Поляндрия', 2],
      ['Новое литературное обозрение', 1],
    ]);
  });
});
