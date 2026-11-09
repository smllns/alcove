import { describe, expect, it } from 'vitest';
import type { Book } from '@/entities/book/types';
import { toDay } from '@/shared/lib/dates';
import { readingYear, readSpans, spanYears } from './readingYears';

let made = 0;
const read = (started?: string, finished?: string): Book => ({
  id: `s${made++}`,
  title: 'A book',
  authors: [],
  createdAt: '2026-03-04T10:00:00.000Z',
  updatedAt: '2026-03-04T10:00:00.000Z',
  copy: { status: 'shelf', reading: 'read', started, finished },
});

describe('reading years', () => {
  it('reads only the books with both days, the finish not before the start', () => {
    const spans = readSpans([
      read('2026-01-01', '2026-01-10'),
      read('2026-01-01'),
      read('2026-02-10', '2026-02-01'),
    ]);
    expect(spans.map((span) => span.days)).toEqual([10]);
  });

  it('runs a book being read now on to today, out of the average', () => {
    const now = new Date();
    const begun = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - 9,
    );
    const reading: Book = {
      ...read(toDay(begun)),
      copy: { status: 'shelf', reading: 'reading', started: toDay(begun) },
    };
    const spans = readSpans([reading, read('2026-01-01', '2026-01-10')]);
    expect(spans[0]).toMatchObject({ reading: true, days: 10 });
    const year = readingYear(spans, now.getFullYear());
    expect(year.laid.some((span) => span.reading)).toBe(true);
  });

  it('lays books read at once one over another, as low as there is room', () => {
    const spans = readSpans([
      read('2025-12-20', '2026-01-05'),
      read('2026-01-03', '2026-01-08'),
      read('2026-01-09', '2026-01-09'),
    ]);
    expect(spanYears(spans)).toEqual([2026, 2025]);
    const year = readingYear(spans, 2026);
    expect(year.laid.map((span) => span.row)).toEqual([0, 1, 0]);
    expect(year.rows).toBe(2);
    // The one begun the year before starts at the year's start
    expect(year.laid[0].left).toBe(0);
    expect(year.average).toBe(8);
  });
});
