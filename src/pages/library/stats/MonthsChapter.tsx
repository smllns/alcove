import { useMemo, useState } from 'react';
import type { Book } from '@/entities/book/types';
import { counted } from '@/shared/lib/plural';
import { ChoiceCapsule } from '@/shared/ui/ChoiceCapsule';
import { sayClass } from './Chapter';
import { byMonth, monthsSoFar, yearsOf, type DayOf } from './growth';
import { MonthShelf } from './MonthShelf';
import { monthly } from './sayings';

// The years to choose between, the latest last
const YEARS = 5;

// A chapter of months: a shelf of twelve bays, the books that came to the
// reader in each month of a year (or, `read`, the books they finished in
// it), the year chosen over it. Going only by the days the reader gave (`dayOf`),
// so a library brought in all at once doesn't crowd one month: under the
// shelf, how many of the books have one, and where to give the rest.
export function MonthsChapter({
  books,
  dayOf,
  read = false,
}: {
  books: Book[];
  dayOf: DayOf;
  read?: boolean;
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
      </p>
    );

  const months = byMonth(books, year, dayOf);
  const soFar = monthsSoFar(year);
  return (
    <>
      <p className={sayClass}>{monthly(months, year, soFar, read)}</p>
      {years.length > 1 && (
        <ChoiceCapsule
          label='Year'
          words
          className='mt-6 w-fit'
          current={String(year)}
          onChange={(next) => setChosen(Number(next))}
          options={years
            .slice(0, YEARS)
            .reverse()
            .map((each) => ({
              value: String(each),
              label: String(each),
            }))}
        />
      )}
      <div className='mt-7'>
        <MonthShelf months={months} soFar={soFar} year={year} />
      </div>
      {dated < books.length && (
        <p className='mt-5 max-w-xl text-[13px] leading-relaxed text-muted'>
          Counting {dated.toLocaleString('en')} of {whose}, those with {which}.
          Add {where} in its details to see more here.
        </p>
      )}
    </>
  );
}
