import type { Book } from '@/entities/book/types';
import { dayMonth, monthLetters, monthOfYear } from '@/shared/lib/dates';
import { counted } from '@/shared/lib/plural';
import { HOVER, useMediaQuery } from '@/shared/lib/useMediaQuery';
import { BooksDrawer } from './BooksDrawer';
import { sideAt } from './cardSide';
import { HoverBooks } from './HoverBooks';
import type { readingYear, Span } from './readingYears';
import { ToneSpine } from './ToneSpine';
import { useBooksDrawer } from './useBooksDrawer';

// How far apart the rows of books lie, and how thick each book is drawn
const ROW = 11;
const THICK = 7;

// What's said of a book in a month's card: from when to when, how long
const datesOf = (span: Span) =>
  `${dayMonth(span.from)} – ${dayMonth(span.to)} · ${counted(span.days, 'day')}`;

// A year of reading, book by book (readingYear): each book read lying
// along the year from the day it was begun to the day it was finished,
// those read at the same time one over another, on a plank over the
// months, which the chapter's other drawings share. A month's books
// (those being read in it) open as a month's do elsewhere (HoverBooks),
// each with its days.
export function SpanTimeline({
  found,
  year,
}: {
  found: ReturnType<typeof readingYear>;
  year: number;
}) {
  const hover = useMediaQuery(HOVER);
  const drawer = useBooksDrawer();
  const { laid, months, rows } = found;
  const dates = new Map(laid.map((span) => [span.book.id, datesOf(span)]));
  const detail = (book: Book) => dates.get(book.id) ?? '';
  const tall = rows * ROW + 8;
  return (
    <div className='relative'>
      <div className='grid grid-cols-12'>
        {months.map((spans, m) => {
          const name = `${monthOfYear(m)} ${year}`;
          const shown = spans.map(({ book }) => book);
          return (
            <HoverBooks
              key={m}
              heading={name}
              books={shown}
              side={sideAt(m, 12)}
              hover={hover}
              onOpen={() => drawer.show(name, shown)}
              detail={detail}
            >
              {/* The month, shaded as it's pointed at; a fine line where
                  one month gives way to the next */}
              <span
                className='block border-l border-dotted border-line transition-colors duration-500 ease-soft group-hover/books:bg-ink/5'
                style={{ height: tall }}
              />
            </HoverBooks>
          );
        })}
      </div>
      {/* The books, over the months, not in the pointer's way */}
      <div
        className='pointer-events-none absolute inset-x-0 top-0'
        style={{ height: tall }}
      >
        {laid.map((span) => (
          <ToneSpine
            key={span.book.id}
            book={span.book}
            className='absolute min-w-1 rounded-[2px]'
            style={{
              left: `${span.left * 100}%`,
              width: `calc(${(span.right - span.left) * 100}% - 1px)`,
              height: THICK,
              bottom: 4 + span.row * ROW,
            }}
          />
        ))}
      </div>
      <div className='stats-plank' />
      <div className='grid grid-cols-12 pt-2'>
        {monthLetters.map((letter, m) => (
          <span key={m} className='text-center text-[11px] text-muted'>
            {letter}
          </span>
        ))}
      </div>
      {!hover && <BooksDrawer {...drawer} detail={detail} />}
    </div>
  );
}
