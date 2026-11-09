import { describe, expect, it } from 'vitest';
import type { Book } from '@/entities/book/types';
import { keptNotes } from './keptNotes';
import { readerFigures } from './readerFigures';

const book = (id: string, fields: Partial<Book> = {}): Book => ({
  id,
  title: `Book ${id}`,
  authors: ['Kurt Vonnegut'],
  createdAt: '2021-03-04T10:00:00.000Z',
  updatedAt: '2021-03-04T10:00:00.000Z',
  ...fields,
});

describe('the reader and a writer', () => {
  it('counts since when, how many read, their pages and the favourite', () => {
    const figures = readerFigures([
      book('a', {
        pages: 300,
        copy: {
          status: 'shelf',
          reading: 'read',
          finished: '2016-05-01',
          rating: 4,
        },
      }),
      book('b', {
        pages: 200,
        copy: {
          status: 'shelf',
          reading: 'read',
          started: '2014-02-01',
          rating: 5,
        },
      }),
      book('c', { pages: 900, copy: { status: 'shelf', reading: 'unread' } }),
    ]);
    expect(figures).toMatchObject({
      since: 2014,
      dated: true,
      read: 2,
      of: 3,
      pages: 500,
    });
    expect(figures.favourite?.id).toBe('b');
  });

  it('falls back on when the books came, with no dates kept', () => {
    expect(readerFigures([book('a')])).toMatchObject({
      since: 2021,
      dated: false,
      favourite: undefined,
    });
  });

  it('keeps the reader’s own lines first, then the writer’s, credited', () => {
    const notes = keptNotes(
      [
        book('a', {
          copy: {
            status: 'shelf',
            quotes: ['So it goes.'],
            notes: ['Read on a train.'],
          },
        }),
      ],
      ['Theirs'],
      'https://en.wikiquote.org/wiki/Kurt_Vonnegut',
    );
    expect(notes.map((n) => [n.text, n.quote, n.book?.id])).toEqual([
      ['So it goes.', true, 'a'],
      ['Read on a train.', false, 'a'],
      ['Theirs', true, undefined],
    ]);
    expect(keptNotes([], ['Theirs'], null)).toEqual([]);
  });
});
