import { risingCover } from '@/entities/book/coverImage';
import type { Book } from '@/entities/book/types';
import type { ReaderPage } from '@/entities/reader/types';
import { BookCover } from '@/entities/book/ui/BookCover';
import { dayMonth, daysFromToday, fromDay } from '@/shared/lib/dates';
import { counted } from '@/shared/lib/plural';
import { readingNow } from './readerBooks';
import { PagePart } from './PagePart';
import { ReaderBookLink } from './ReaderBookLink';

// The books a reader is reading now, each with the day they began it and
// how long ago that was
export function ReadingNow({
  page,
  owned,
}: {
  page: ReaderPage;
  owned: Map<string, Book>;
}) {
  const books = readingNow(page.books);
  if (!page.shows.reading || !books.length) return null;
  return (
    <PagePart title='Reading now' part='reading' page={page}>
      <ul className='grid gap-6 sm:grid-cols-2'>
        {books.map((book) => {
          const began = book.started && fromDay(book.started);
          const ago = book.started ? daysFromToday(book.started) : null;
          const days = ago === null ? 0 : 1 - ago;
          return (
            <li key={book.id}>
              <ReaderBookLink
                book={book}
                owned={owned}
                className='group grid grid-cols-[4.5rem_1fr] items-center gap-4'
              >
                <BookCover
                  title={book.title}
                  author={book.authors[0]}
                  url={book.coverUrl}
                  className={risingCover}
                />
                <span className='min-w-0'>
                  <span className='block font-serif text-lg leading-snug'>
                    {book.title}
                  </span>
                  <span className='block truncate text-[0.8125rem] text-muted'>
                    {book.authors.join(', ')}
                  </span>
                  {began && (
                    <span className='mt-2 block text-xs text-faint'>
                      Since {dayMonth(began)}
                      {days > 1 && ` · ${counted(days, 'day')} in`}
                    </span>
                  )}
                </span>
              </ReaderBookLink>
            </li>
          );
        })}
      </ul>
    </PagePart>
  );
}
