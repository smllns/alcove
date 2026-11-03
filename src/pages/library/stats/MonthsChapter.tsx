import { useMemo, useState, type ReactNode } from 'react';
import type { Book } from '@/entities/book/types';
import { counted } from '@/shared/lib/plural';
import { noteClass, sayClass } from './Chapter';
import { pagesOf } from './libraryStats';
import { byMonth, monthsSoFar, yearsOf, type DayOf } from './growth';
import { MonthPages } from './MonthPages';
import { MonthShelf } from './MonthShelf';
import { ScaleHeading } from './ScaleHeading';
import { monthly } from './sayings';
import { YearSwitch } from './YearSwitch';

// A chapter of months: a shelf of twelve bays, the books that came to the
// reader in each month of a year (or, `read`, the books they finished in
// it, and under them the pages read each month), the year chosen over it.
// Going only by the days the reader gave (`dayOf`), so a library brought
// in all at once doesn't crowd one month: under the shelf, how many of the
// books have one, and where to give the rest.
export function MonthsChapter({
  books,
  dayOf,
  read = false,
  more,
}: {
  books: Book[];
  dayOf: DayOf;
  read?: boolean;
  // Said after the months, of the books whatever the year
  more?: ReactNode;
}) {
  const years = useMemo(() => yearsOf(books, dayOf), [books, dayOf]);
  const [chosen, setChosen] = useState<number>();
  const year = chosen ?? years[0];
  const dated = useMemo(
    () => books.filter((book) => dayOf(book)).length,
    [books, dayOf],
  );
  // The day that counts, said of one book and of those that have it
  const [where, which] = read
    ? ['when you finished a book', 'the day you finished them']
    : ['when a book came to you', 'the day they came to you'];
  const whose = read
    ? `the ${counted(books.length, 'book')} you’ve read`
    : `your ${counted(books.length, 'book')}`;
  if (!dated)
    return (
      <p className={sayClass}>
        None of your books has a date for it yet. Add {where} in its details,
        and it’ll show up here.
        {more}
      </p>
    );

  const months = byMonth(books, year, dayOf);
  const soFar = monthsSoFar(year);
  const finished = months.flat().length;
  // The books finished in the year with no pages given, left out of the
  // pages
  const unpaged = read ? months.flat().filter((book) => !book.pages).length : 0;
  return (
    <>
      <p className={sayClass}>
        {monthly(months, year, soFar, read)}
        {more}
      </p>
      <YearSwitch years={years} year={year} onChange={setChosen} />
      <div className='mt-7'>
        {/* Named, as the pages under it are */}
        {read && (
          <ScaleHeading name='Books' className='mb-4'>
            {counted(finished, 'book')} · about{' '}
            {(finished / Math.max(1, soFar)).toFixed(1).replace(/\.0$/, '')} a
            month
          </ScaleHeading>
        )}
        <MonthShelf
          months={months}
          soFar={soFar}
          year={year}
          detail={read ? pagesOf : undefined}
        />
      </div>
      {read && <MonthPages months={months} soFar={soFar} />}
      {(dated < books.length || unpaged > 0) && (
        <p className={noteClass}>
          {dated < books.length && (
            <>
              Counting {dated.toLocaleString('en')} of {whose}, those with{' '}
              {which}. Add {where} in its details to see more here.{' '}
            </>
          )}
          {unpaged > 0 &&
            (unpaged === finished ? (
              <>
                None of the books you finished in {year} has its pages given.
                Add them in a book’s details to see the pages here.
              </>
            ) : (
              <>
                {counted(unpaged, 'book')} you finished in {year}{' '}
                {unpaged === 1 ? 'has' : 'have'} no pages given, so{' '}
                {unpaged === 1 ? 'its' : 'their'} pages aren’t counted. Add them
                in a book’s details.
              </>
            ))}
        </p>
      )}
    </>
  );
}
