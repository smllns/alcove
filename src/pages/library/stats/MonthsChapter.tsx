import { useMemo, useState, type ReactNode } from 'react';
import type { Book } from '@/entities/book/types';
import { counted } from '@/shared/lib/plural';
import { noteClass, sayClass } from './Chapter';
import { byMonth, cameOn, monthsSoFar, yearsOf } from './growth';
import { MonthShelf } from '@/widgets/book-cards';
import { monthly } from './sayings';
import { YearSwitch } from './YearSwitch';

// A chapter of months: a shelf of twelve bays, the books that came to the
// reader in each month of a year, the year chosen over it. Going only by
// the days the reader gave, so a library brought in all at once doesn't
// crowd one month: under the shelf, how many of the books have one, and
// where to give the rest.
export function MonthsChapter({
  books,
  more,
}: {
  books: Book[];
  // Said after the months, of the books whatever the year
  more?: ReactNode;
}) {
  const years = useMemo(() => yearsOf(books, cameOn), [books]);
  const [chosen, setChosen] = useState<number>();
  const year = chosen ?? years[0];
  const dated = useMemo(
    () => books.filter((book) => cameOn(book)).length,
    [books],
  );
  if (!dated)
    return (
      <p className={sayClass}>
        None of your books has a date for it yet. Add when a book came to you in
        its details, and it’ll show up here.
        {more}
      </p>
    );

  const months = byMonth(books, year, cameOn);
  const soFar = monthsSoFar(year);
  return (
    <>
      <p className={sayClass}>
        {monthly(months, year, soFar)}
        {more}
      </p>
      <YearSwitch years={years} year={year} onChange={setChosen} />
      <div className='mt-7'>
        <MonthShelf months={months} soFar={soFar} year={year} />
      </div>
      {dated < books.length && (
        <p className={noteClass}>
          Counting {dated.toLocaleString('en')} of your{' '}
          {counted(books.length, 'book')}, those with the day they came to you.
          Add when a book came to you in its details to see more here.
        </p>
      )}
    </>
  );
}
