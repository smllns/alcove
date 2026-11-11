import { spineSize } from '@/entities/book/spine';
import { monthLetters, monthOfYear } from '@/shared/lib/dates';
import type { Book } from '@/entities/book/types';
import { cn } from '@/shared/lib/cn';
import { counted } from '@/shared/lib/plural';
import { HOVER, useMediaQuery } from '@/shared/lib/useMediaQuery';
import { BooksDrawer } from './BooksDrawer';
import { HoverBooks } from './HoverBooks';
import { RisingSpine } from './ToneSpine';
import { useBooksDrawer } from './useBooksDrawer';

// The most books a bay stands, as many as fit a phone's narrow bays
const SHOWN = 12;

// A year as a shelf of twelve bays, a month each, with the books of that
// month standing in it, as many over it as there are (gold, over the
// busiest); the months still to come pale and empty. A month with books
// opens them to choose from (HoverBooks): pointed at, in a card over its
// bay, its spines rising a touch; on a screen with no pointer to hover,
// tapped (or its letter), in a drawer.
export function MonthShelf({
  months,
  soFar,
  year,
  detail,
}: {
  months: Book[][];
  // How many of the months have come
  soFar: number;
  year: number;
  // What's said of each book in a month's card, if anything
  detail?: (book: Book) => string;
}) {
  const hover = useMediaQuery(HOVER);
  const drawer = useBooksDrawer();
  const open = (m: number) =>
    drawer.show(`${monthOfYear(m)} ${year}`, months[m]);
  const most = Math.max(...months.map((books) => books.length));
  return (
    <>
      <div className='grid grid-cols-12 items-end gap-x-1.5'>
        {months.map((books, m) => {
          const come = m < soFar;
          const many = counted(books.length, 'book');
          return (
            <HoverBooks
              key={m}
              heading={monthOfYear(m)}
              meta={`${year} · ${many}`}
              books={books}
              hover={hover}
              onOpen={() => open(m)}
              detail={detail}
              className={cn(!come && 'opacity-35')}
              over={
                <span
                  className={cn(
                    'mb-1.5 text-center font-serif text-sm',
                    books.length === most && most > 0
                      ? 'text-gold-ink'
                      : 'text-faint',
                  )}
                >
                  {come ? books.length || '—' : ' '}
                </span>
              }
            >
              <span className='flex h-20 items-end justify-center gap-0.5'>
                {books.slice(0, SHOWN).map((book) => (
                  <RisingSpine
                    key={book.id}
                    book={book}
                    height={Math.round(spineSize(book).height * 0.72)}
                    className='min-w-px shrink basis-2'
                  />
                ))}
              </span>
            </HoverBooks>
          );
        })}
        <div className='stats-plank col-span-12' />
        {monthLetters.map((letter, m) => (
          <button
            key={m}
            type='button'
            tabIndex={-1}
            disabled={hover || !months[m].length}
            onClick={() => open(m)}
            className='mt-2 text-center text-xs tracking-wide text-muted disabled:cursor-default'
          >
            {letter}
          </button>
        ))}
      </div>
      {!hover && <BooksDrawer {...drawer} detail={detail} />}
    </>
  );
}
