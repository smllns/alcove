import type { Ref } from 'react';
import type { Book } from '@/entities/book/types';
import { readingState } from '@/entities/book/reading';
import { cn } from '@/shared/lib/cn';
import { Eyebrow, PageTitle } from '@/shared/ui/PageHeading';
import { TapedLabel } from '@/shared/ui/TapedLabel';
import { AuthorByline } from './AuthorByline';
import { BookRatings } from './BookRatings';
import { loanLine } from './copyLines';

// Where it sits in a series: "The Expanse · Book 3"
const seriesLine = (series: Book['series']) =>
  series &&
  [series.name, series.number !== undefined && `Book ${series.number}`]
    .filter(Boolean)
    .join(' · ');

// The book's title, who wrote it (with the first lines about them, and how
// many more of theirs the reader has: AuthorByline), and at a glance where the
// reader is with it: labels taped on for whether it's been read and
// whether it's out on loan, and the ratings.
// `ref`: the title, to tell when it's been scrolled out of sight.
export function BookHeading({
  book,
  ref,
}: {
  book: Book;
  ref?: Ref<HTMLDivElement>;
}) {
  const reading = book.copy?.reading && readingState(book.copy.reading);
  const status = [loanLine(book.copy)].filter(Boolean);
  const series = seriesLine(book.series);

  return (
    <header
      className={cn(
        'flex flex-col',
        // Room on the right for the labels taped up in the corner
        (reading || status.length > 0) && 'sm:pr-44',
      )}
    >
      {(reading || status.length > 0) && (
        // Taped on in the sheet's top corner, level with the title; on a
        // phone, too narrow to share with it, under the author
        <ul
          aria-label='Where you are with it'
          className='order-1 mt-6 flex animate-rise flex-wrap items-start gap-x-5 gap-y-6 sm:absolute sm:right-10 sm:top-10 sm:mt-1 sm:flex-col sm:items-end'
          style={{ animationDelay: '180ms' }}
        >
          {reading && (
            <li>
              <TapedLabel tone={reading.tone} tilt={-3}>
                {reading.badge}
              </TapedLabel>
            </li>
          )}
          {status.map((line) => (
            <li key={line}>
              <TapedLabel tone='var(--loan)' tilt={2} piece={1}>
                {line}
              </TapedLabel>
            </li>
          ))}
        </ul>
      )}
      {series && (
        <Eyebrow rise={0} className='mb-3 sm:mb-4'>
          {series}
        </Eyebrow>
      )}
      <div ref={ref}>
        <PageTitle rise={60} className='font-medium text-balance'>
          {book.title}
        </PageTitle>
      </div>
      {book.subtitle && (
        <p
          className='mt-3 animate-rise font-serif text-xl leading-snug text-ink-soft italic sm:text-2xl'
          style={{ animationDelay: '100ms' }}
        >
          {book.subtitle}
        </p>
      )}
      <AuthorByline book={book} />
      <div
        className='order-2 mt-8 animate-rise'
        style={{ animationDelay: '220ms' }}
      >
        <BookRatings book={book} />
      </div>
    </header>
  );
}
