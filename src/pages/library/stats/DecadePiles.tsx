import type { Book } from '@/entities/book/types';
import { cn } from '@/shared/lib/cn';
import { counted } from '@/shared/lib/plural';
import { HOVER, useMediaQuery } from '@/shared/lib/useMediaQuery';
import { yearOf, type byDecade } from './libraryStats';
import { BookEnds } from './BookEnds';
import { BooksDrawer } from '@/widgets/book-cards';
import { HoverBooks } from '@/widgets/book-cards';
import { Pile, PileCount } from './Pile';
import { drawnOf, pilesWidth } from './piles';
import { useBooksDrawer } from '@/widgets/book-cards';

// How wide a fold of empty decades is, against a decade's width
const FOLD = 0.6;

type Column = NonNullable<ReturnType<typeof byDecade>>['columns'][number];
const folded = (column: Column) => column.to !== undefined;

// A decade written under its pile: in full at a century's turn, and where
// the century isn't plain from the decade before it (the first, or one
// after a fold into another century), otherwise by its last two figures
const decadeName = (from: number, older: boolean, before?: number) =>
  older
    ? `<${from + 10}`
    : from % 100 &&
        before !== undefined &&
        Math.floor(before / 100) === Math.floor(from / 100)
      ? `’${String(from).slice(2)}`
      : from;

// What's said of each book in a decade: the year it was written
const yearWritten = (book: Book) => String(yearOf(book) ?? '');

// The books by decade, each decade a pile of them lying one on another
// (as a list's pile is), how many over it, a ruler of the years under the
// piles (broken where a long run of empty decades is folded away); a
// decade's books opened to choose from as a month's are (HoverBooks), each
// with its year; and the oldest book and the newest, ruled off under them
// (BookEnds)
export function DecadePiles({
  decades,
}: {
  decades: NonNullable<ReturnType<typeof byDecade>>;
}) {
  const { columns, oldest, newest } = decades;
  const drawn = columns.map((column) => drawnOf(column.books));
  const hover = useMediaQuery(HOVER);
  const drawer = useBooksDrawer();
  // Each column's share of the width, a fold narrower than a decade, and
  // where along the ruler each one's middle falls
  const widths = columns.map((column) => (folded(column) ? FOLD : 1));
  const whole = widths.reduce((sum, width) => sum + width, 0);
  const middles = widths.map(
    (width, i) =>
      ((widths.slice(0, i).reduce((sum, w) => sum + w, 0) + width / 2) /
        whole) *
      100,
  );
  // Every other decade written on a phone, counting only the decades, and
  // always those either side of a fold
  const written = columns.map(
    (_, i) =>
      columns.slice(0, i + 1).filter((each) => !folded(each)).length % 2 ===
        1 || [columns[i - 1], columns[i + 1]].some((c) => c && folded(c)),
  );
  return (
    <>
      <div style={{ maxWidth: pilesWidth(whole) }}>
        <div
          className='grid items-end gap-x-1.5'
          style={{
            gridTemplateColumns: widths.map((width) => `${width}fr`).join(' '),
          }}
        >
          {columns.map((column, i) => {
            const { from, older, books } = column;
            // A fold, nothing in it to open
            if (folded(column)) return <span key={from} />;
            const name = older ? `Before ${from + 10}` : `The ${from}s`;
            return (
              <HoverBooks
                key={from}
                heading={name}
                books={books}
                hover={hover}
                onOpen={() => drawer.show(name, books)}
                detail={yearWritten}
                className='items-stretch'
                over={<PileCount count={books.length} />}
              >
                <Pile books={drawn[i]} />
              </HoverBooks>
            );
          })}
        </div>
        <div className='relative mt-2 h-8 border-t border-(--fine)'>
          {columns.map((column, i) => {
            const left = `${middles[i]}%`;
            // A fold, the ruler broken across it as a drawing breaks a line
            // too long to draw: two slants over a gap in it
            if (folded(column))
              return (
                <svg
                  key={column.from}
                  aria-hidden
                  viewBox='0 0 16 14'
                  className='absolute -top-[7px] h-3.5 w-4 -translate-x-1/2 text-(--fine)'
                  style={{ left }}
                >
                  <rect
                    x='3'
                    y='5'
                    width='10'
                    height='4'
                    fill='var(--bg-mid)'
                  />
                  <path
                    d='M2 12 L7 2 M9 12 L14 2'
                    stroke='currentColor'
                    strokeWidth='1.2'
                    fill='none'
                  />
                </svg>
              );
            const last = i === columns.length - 1;
            return (
              <span key={column.from}>
                <i
                  className='absolute -top-1 h-2 w-px bg-(--fine)'
                  style={{ left }}
                />
                <em
                  className={cn(
                    'absolute top-2.5 -translate-x-1/2 text-xs whitespace-nowrap text-muted not-italic',
                    !written[i] && !last && 'max-sm:hidden',
                  )}
                  // Kept within the ruler at its ends
                  style={{
                    left: `clamp(1.3rem, ${left}, calc(100% - 1.3rem))`,
                  }}
                >
                  {decadeName(
                    column.from,
                    column.older,
                    // The decade drawn before it, past any fold
                    i > 0
                      ? columns[folded(columns[i - 1]) ? i - 2 : i - 1]?.from
                      : undefined,
                  )}
                </em>
              </span>
            );
          })}
        </div>
      </div>
      <div className='mt-8'>
        <BookEnds
          first={{ kind: 'The oldest', book: oldest }}
          last={{ kind: 'The newest', book: newest }}
          only='The only dated book'
          value={yearOf}
          measure={counted(
            (yearOf(newest) ?? 0) - (yearOf(oldest) ?? 0),
            'year',
          )}
        />
      </div>
      {!hover && <BooksDrawer {...drawer} detail={yearWritten} />}
    </>
  );
}
