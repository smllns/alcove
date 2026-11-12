import type { Book } from '@/entities/book/types';
import type { ReaderPage } from '@/entities/reader/types';
import { pagesOf } from '@/entities/book/pages';
import {
  MonthShelf,
  readingYear,
  readSpans,
  YearSpans,
} from '@/widgets/book-cards';
import { asBook, yearOf } from './readerBooks';
import { PagePart } from './PagePart';

// A reader's year in reading so far: how many books they finished, their
// pages and the stars given on average, the year as a shelf of months
// with the books finished in each (MonthShelf, as in the stats), and each
// book from start to finish under it (SpanTimeline), where the days are
// given
export function ReaderYear({
  page,
  owned,
}: {
  page: ReaderPage;
  owned: Map<string, Book>;
}) {
  const now = new Date();
  const year = now.getFullYear();
  const { read, pages, average, months } = yearOf(page.books, year);
  if (!page.shows.year || !read.length) return null;
  // Each book read this year from the day it was begun to the day it was
  // finished, as in the stats (SpanTimeline)
  const span = readingYear(
    readSpans(page.books.map((book) => asBook(book, owned))),
    year,
  );
  const figures = [
    { label: read.length === 1 ? 'Book' : 'Books', value: read.length },
    ...(pages > 0
      ? [{ label: 'Pages', value: pages.toLocaleString('en') }]
      : []),
    ...(average !== null
      ? [{ label: 'Avg stars', value: average.toFixed(1) }]
      : []),
  ];
  return (
    <PagePart title={`${year} in reading`} part='year' page={page}>
      <div className='grid items-end gap-8 lg:grid-cols-[auto_1fr]'>
        <dl className='flex gap-7'>
          {figures.map(({ label, value }) => (
            <div key={label} className='flex flex-col-reverse gap-1'>
              <dt className='text-xs uppercase tracking-[0.14em] text-muted'>
                {label}
              </dt>
              <dd className='font-serif text-[2.125rem] leading-none'>
                {value}
              </dd>
            </div>
          ))}
        </dl>
        <MonthShelf
          months={months.map((books) =>
            books.map((book) => asBook(book, owned)),
          )}
          soFar={now.getMonth() + 1}
          year={year}
          detail={pagesOf}
        />
      </div>
      <YearSpans found={span} year={year} className='mt-10' />
    </PagePart>
  );
}
