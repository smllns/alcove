import { useMemo, useState } from 'react';
import type { Book } from '@/entities/book/types';
import { counted } from '@/shared/lib/plural';
import { noteClass, sayClass } from './Chapter';
import { byMonth, finishedOn, monthsSoFar, yearsOf } from './growth';
import { pagesOf } from '@/entities/book/pages';
import { MonthPages } from './MonthPages';
import {
  MonthShelf,
  readingYear,
  spanYears,
  YearSpans,
  type Span,
} from '@/widgets/book-cards';
import { startToFinish, unpagedNote } from './readingSayings';
import { ScaleHeading } from '@/shared/ui/ScaleHeading';
import { monthly } from './sayings';
import { YearSwitch } from './YearSwitch';

// A year of reading, the year chosen over it, every drawing on the same
// months: each book read from the day it was begun to the day it was
// finished (SpanTimeline), then the books finished each month on their
// shelf, the months written under it, and the pages read each month
// hanging under them. Going only by the days the reader gave: under it,
// how many of the books have them, and where to give the rest.
export function ReadingChapter({
  books,
  spans,
}: {
  // The books read, and those of them with both days given
  books: Book[];
  spans: Span[];
}) {
  const years = useMemo(
    () =>
      [...new Set([...yearsOf(books, finishedOn), ...spanYears(spans)])].sort(
        (a, b) => b - a,
      ),
    [books, spans],
  );
  const [chosen, setChosen] = useState<number>();
  const year = chosen ?? years[0];
  const dated = books.filter((book) => finishedOn(book)).length;
  if (!years.length)
    return (
      <p className={sayClass}>
        None of your books has a date for it yet. Add when you finished a book
        in its details, and it’ll show up here.
      </p>
    );

  const months = byMonth(books, year, finishedOn);
  const soFar = monthsSoFar(year);
  const finished = months.flat().length;
  const span = readingYear(spans, year);
  // The books finished in the year with no pages given, left out of the
  // pages
  const unpaged = months.flat().filter((book) => !book.pages).length;
  // Books left out for want of a day, from the shelf or from start to finish
  const undated = dated < books.length;
  const finishedSpans = spans.filter((each) => !each.reading).length;
  const unspanned = finishedSpans < books.length;
  return (
    <>
      <p className={sayClass}>
        {monthly(months, year, soFar, true)}
        {span.laid.length > 0 && <> {startToFinish(span.average, span.rows)}</>}
      </p>
      <YearSwitch years={years} year={year} onChange={setChosen} />
      <YearSpans found={span} year={year} className='mt-7' />
      <div className='mt-8'>
        {/* Named, as the pages under it are */}
        <ScaleHeading name='Books' className='mb-4'>
          {counted(finished, 'book')} · about{' '}
          {(finished / Math.max(1, soFar)).toFixed(1).replace(/\.0$/, '')} a
          month
        </ScaleHeading>
        <MonthShelf
          months={months}
          soFar={soFar}
          year={year}
          detail={pagesOf}
        />
      </div>
      <MonthPages months={months} soFar={soFar} />
      {(undated || unspanned || unpaged > 0) && (
        <p className={noteClass}>
          {undated && (
            <>
              Counting {dated.toLocaleString('en')} of the{' '}
              {counted(books.length, 'book')} you’ve read, those with the day
              you finished them.{' '}
            </>
          )}
          {unspanned && (
            <>
              From start to finish, {finishedSpans.toLocaleString('en')} of
              them, those with both days.{' '}
            </>
          )}
          {(undated || unspanned) && (
            <>Add the days in a book’s details to see more here. </>
          )}
          {unpagedNote(unpaged, finished, year)}
        </p>
      )}
    </>
  );
}
