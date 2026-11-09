import { describe, expect, it } from 'vitest';
import type { Book, SimilarBook } from '@/entities/book/types';
import { copiesOf, inTheirTime, oneWorkEach } from '@/entities/book/theirWorks';
import { lifePins, pinRows, rulerSpan } from './writerBooks';

const book = (id: string, fields: Partial<Book> = {}): Book => ({
  id,
  title: 'A book',
  authors: ['Kurt Vonnegut'],
  createdAt: '2026-03-04T10:00:00.000Z',
  updatedAt: '2026-03-04T10:00:00.000Z',
  ...fields,
});
const work = (workKey: string, title: string, year?: number, bookId?: string) =>
  ({
    workKey,
    title,
    authors: ['Kurt Vonnegut'],
    firstPublishYear: year,
    editionCount: 3,
    bookId,
  }) satisfies SimilarBook;

describe('a writer’s life and works', () => {
  it('puts their books along their life, the reader’s as theirs', () => {
    const works = [
      work('OL1W', 'Slaughterhouse-Five', 1969, 'b1'),
      work('OL2W', 'Cat’s Cradle', 1963),
      work('OL3W', 'Player Piano', 1952),
      work('OL4W', 'No Year'),
    ];
    const theirs = [
      book('b1', {
        title: 'Бойня номер пять',
        copy: { status: 'shelf', reading: 'read' },
      }),
      // Added by hand: theirs by its title
      book('b2', { title: 'Cat’s Cradle (Penguin)' }),
      // Not in the catalogue at all, but with a year
      book('b3', { title: 'Timequake', firstPublishedYear: 1997 }),
      book('b4', { title: 'Undated' }),
    ];
    const pins = lifePins(works, theirs, copiesOf(theirs, works));
    expect(pins.map((p) => [p.year, p.title, p.bookId, p.read])).toEqual([
      [1952, 'Player Piano', undefined, false],
      [1963, 'Cat’s Cradle (Penguin)', 'b2', false],
      [1969, 'Бойня номер пять', 'b1', true],
      [1997, 'Timequake', 'b3', false],
    ]);
  });

  it('knows a translation by its original title, or its year', () => {
    const works = [
      work('OL1W', 'Trainspotting', 1993),
      work('OL2W', 'Porno', 2002),
      work('OL3W', 'Glue', 2001),
      work('OL4W', 'Filth', 1998),
      work('OL5W', 'Skagboys', 2012),
      work('OL6W', 'The Blade Artist', 2012),
    ];
    const copyOf = copiesOf(
      [
        book('a', {
          title: 'На игле',
          originalTitle: 'Trainspotting',
          firstPublishedYear: 1993,
        }),
        book('b', { title: 'Клей', firstPublishedYear: 2001 }),
        // Two of theirs from that year: not told apart by it
        book('c', { title: 'Нечто', firstPublishedYear: 2012 }),
      ],
      works,
    );
    expect(works.map((w) => copyOf(w).bookId)).toEqual([
      'a',
      undefined,
      'b',
      undefined,
      undefined,
      undefined,
    ]);
  });

  it('takes a translation kept apart for the book it translates', () => {
    const works = [
      work('OL1W', 'Day of the Oprichnik', 2011),
      work('OL2W', 'Denʹ oprichnika', 2006, 'a'),
      work('OL3W', 'Telluria', 2013),
    ];
    const theirs = [
      book('a', { title: 'День опричника', firstPublishedYear: 2006 }),
    ];
    const titles = new Map([['a', ['День опричника', 'Day of the Oprichnik']]]);
    const copyOf = copiesOf(theirs, works, titles);
    expect(works.map((w) => copyOf(w).bookId)).toEqual(['a', 'a', undefined]);
    expect(oneWorkEach(works, copyOf).map((w) => w.title)).toEqual([
      'Denʹ oprichnika',
      'Telluria',
    ]);
  });

  it('leaves out books from before they could have written them', () => {
    const found = inTheirTime(
      [
        work('OL1W', 'Old', 1656),
        work('OL2W', 'Eileen', 2015),
        work('OL3W', 'Undated'),
      ],
      1981,
    );
    expect(found.map((w) => w.title)).toEqual(['Eileen', 'Undated']);
    // Long after they died: a translation the catalogue keeps apart
    const late = inTheirTime(
      [
        work('OL4W', 'Venus im Pelz', 1870),
        work('OL5W', 'Venus in Furs', 1997),
      ],
      1836,
      1895,
    );
    expect(late.map((w) => w.title)).toEqual(['Venus im Pelz']);
  });

  it('raises a book over those it would cover, as low as it’ll go', () => {
    expect(pinRows([0, 10, 60, 70, 120], 50)).toEqual([0, 1, 0, 1, 0]);
    // Two rows at most: the third goes where it comes nearest least
    expect(pinRows([0, 10, 20], 50, 2)).toEqual([0, 1, 0]);
  });

  it('runs over their books alone on a phone', () => {
    expect(
      rulerSpan([{ year: 1952 }, { year: 2008 }], 1922, 2007, true),
    ).toEqual({
      from: 1950,
      to: 2010,
      born: undefined,
      died: 2007,
    });
  });

  it('runs from birth to death, taking in books after', () => {
    expect(rulerSpan([{ year: 1952 }, { year: 2008 }], 1922, 2007)).toEqual({
      from: 1922,
      to: 2008,
      born: 1922,
      died: 2007,
    });
  });
});
