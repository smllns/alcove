import { useRef } from 'react';
import { spineSize } from '@/entities/book/spine';
import type { Book } from '@/entities/book/types';
import { cn } from '@/shared/lib/cn';
import { useMeasured } from '@/shared/lib/useMeasured';
import { HOVER, useMediaQuery } from '@/shared/lib/useMediaQuery';
import type { Tally } from './tallies';
import { BooksDrawer } from './BooksDrawer';
import { HoverBooks } from './HoverBooks';
import { LedgerWithMore } from './Ledger';
import { RisingSpine } from './ToneSpine';
import { useBooksDrawer } from './useBooksDrawer';

// How tall the spines stand against their formats, in the finer lines less
const TALL = 0.6;
const TALL_FINE = 0.28;

// Things the books are counted by (genres, how they were read, their
// stars) kept as a ledger, in the order given: each its name (its place
// before it, `ranked`, for the commonest first), its books standing in a
// row on a plank (as long as there are books), how many and what share of
// the books counted that is. Only a few, all of them alike; more, the
// first few written large and the rest opening out under them, as the
// authors' do (LedgerWithMore). A line's books open as a month's do
// (HoverBooks): pointed at, in a card over it; tapped, in a drawer.
export function SpineLedger({
  rows,
  noun,
  ranked = false,
  detail,
}: {
  rows: Tally[];
  noun: string;
  ranked?: boolean;
  // What's said of each book in a line's card, if anything
  detail?: (book: Book) => string;
}) {
  const hover = useMediaQuery(HOVER);
  const drawer = useBooksDrawer();
  // The books counted, each once, for each line's share
  const sorted = new Set(rows.flatMap((row) => row.books)).size;
  const open = (row: Tally) => drawer.show(row.name, row.books);
  return (
    <>
      <LedgerWithMore
        items={rows}
        noun={noun}
        drawn
        hover={hover}
        onOpen={open}
        row={(line, fine, place) => (
          <li key={line.name}>
            <HoverBooks
              heading={line.name}
              books={line.books}
              side='start'
              hover={hover}
              onOpen={() => open(line)}
              detail={detail}
            >
              <Row
                place={ranked ? place : undefined}
                line={line}
                share={line.books.length / sorted}
                fine={fine}
              />
            </HoverBooks>
          </li>
        )}
      />
      {!hover && <BooksDrawer {...drawer} detail={detail} />}
    </>
  );
}

// How many spines stand whole on a plank, from the first one's width and
// the gap between them
function spinesRoom(plank: HTMLElement) {
  const first = plank.firstElementChild;
  if (!first) return Infinity;
  const { columnGap, paddingLeft } = getComputedStyle(plank);
  const gap = parseFloat(columnGap) || 0;
  const width = plank.clientWidth - (parseFloat(paddingLeft) || 0);
  return Math.floor(
    (width + gap) / (first.getBoundingClientRect().width + gap),
  );
}

// A line of the ledger: its place (if ranked) and name, its books
// standing on their plank (as many as fit it whole), upright and as tall
// as their formats as the spines are everywhere, how many and what share
// of the books counted that is; a finer one for the lines opened out. Each
// book rises a touch as the line's pointed at, lifted by a box of its own
// (RisingSpine: the spine's own transition would leave a lift on it to
// jump).
function Row({
  place,
  line,
  share,
  fine,
}: {
  place?: number;
  line: Tally;
  share: number;
  fine: boolean;
}) {
  const plank = useRef<HTMLSpanElement>(null);
  // As many as stand whole on the plank; those past it aren't drawn
  const room = useMeasured(plank, spinesRoom) ?? Infinity;
  return (
    <span
      className={cn(
        'flex items-end text-left',
        fine ? 'gap-2.5' : 'gap-4 max-sm:gap-2.5',
      )}
    >
      <span
        className={cn(
          'flex shrink-0 items-baseline gap-2 font-serif italic transition-colors duration-500 ease-soft group-hover/books:text-ink',
          fine
            ? 'w-28 text-sm text-ink-soft'
            : 'w-42 pb-0.5 text-[17px] max-sm:w-28',
        )}
      >
        {place !== undefined && (
          <span className='w-4 shrink-0 font-sans text-[11px] text-faint not-italic'>
            {place}
          </span>
        )}
        <span className='min-w-0 max-sm:line-clamp-2 max-sm:leading-tight sm:truncate'>
          {line.name}
        </span>
      </span>
      <span
        ref={plank}
        className={cn(
          // Cut at its end until it's measured, never reaching the numbers
          'flex min-w-0 flex-1 items-end overflow-x-clip border-b-(--poche) pl-0.5',
          fine ? 'gap-px border-b-[1.5px]' : 'gap-0.5 border-b-3 max-sm:gap-px',
        )}
      >
        {line.books.slice(0, room).map((book) => (
          <RisingSpine
            key={book.id}
            book={book}
            height={Math.round(
              spineSize(book).height * (fine ? TALL_FINE : TALL),
            )}
            className={cn('shrink-0', fine ? 'w-1' : 'w-1.5 max-sm:w-1')}
          />
        ))}
      </span>
      <span
        className={cn(
          'flex shrink-0 items-baseline justify-end gap-2',
          fine ? 'w-14' : 'w-20 max-sm:w-16',
        )}
      >
        <span
          className={cn('font-serif', fine ? 'text-sm text-muted' : 'text-lg')}
        >
          {line.books.length}
        </span>
        <span
          className={cn(
            'text-right text-muted',
            fine ? 'w-7 text-[11px]' : 'w-8 text-xs',
          )}
        >
          {Math.max(1, Math.round(share * 100))}%
        </span>
      </span>
    </span>
  );
}
