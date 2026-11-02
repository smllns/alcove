import { spineSize } from '@/entities/book/spine';
import { cn } from '@/shared/lib/cn';
import { HOVER, useMediaQuery } from '@/shared/lib/useMediaQuery';
import type { Tally } from './libraryStats';
import { BooksDrawer } from './BooksDrawer';
import { HoverBooks } from './HoverBooks';
import { LedgerWithMore } from './Ledger';
import { ToneSpine } from './ToneSpine';
import { useBooksDrawer } from './useBooksDrawer';

// The most spines a row stands; past that, one stands for several books,
// so the longest still fits a phone's width
const WIDEST = 36;
// How tall the spines stand against their formats, in the finer lines less
const TALL = 0.6;
const TALL_FINE = 0.28;

// The genres ranked as a ledger is kept, the commonest first: each its
// place, its name, its books standing in a row on a plank (as long as
// there are books), how many and what share of the books that is. Only a
// few, all of them alike; more, the commonest few written large and the
// rest opening out under them, as the authors' do (LedgerWithMore). A
// genre's books open as a month's do (HoverBooks): pointed at, in a card
// over it; tapped, in a drawer.
export function GenreLedger({ genres }: { genres: Tally[] }) {
  const hover = useMediaQuery(HOVER);
  const drawer = useBooksDrawer();
  const every = Math.ceil(genres[0].books.length / WIDEST);
  // The books with a genre, each counted once, for each genre's share
  const sorted = new Set(genres.flatMap((genre) => genre.books)).size;
  const open = (genre: Tally) => drawer.show(genre.name, genre.books);
  return (
    <>
      <LedgerWithMore
        items={genres}
        noun='genre'
        drawn
        hover={hover}
        onOpen={open}
        row={(genre, fine, place) => (
          <li key={genre.name}>
            <HoverBooks
              heading={genre.name}
              books={genre.books}
              side='start'
              hover={hover}
              onOpen={() => open(genre)}
            >
              <Row
                place={place}
                genre={genre}
                share={genre.books.length / sorted}
                every={every}
                fine={fine}
              />
            </HoverBooks>
          </li>
        )}
      />
      {!hover && <BooksDrawer {...drawer} />}
    </>
  );
}

// A line of the ledger: the genre's place and name, its books standing
// on their plank, upright and as tall as their formats as the spines are
// everywhere, how many and what share of the books with a genre that is;
// a finer one for the genres opened out. Each book rises a touch as the
// line's pointed at, lifted by a box of its own (the spine's own
// transition would leave a lift on it to jump).
function Row({
  place,
  genre,
  share,
  every,
  fine,
}: {
  place: number;
  genre: Tally;
  share: number;
  every: number;
  fine: boolean;
}) {
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
        <span className='w-4 shrink-0 font-sans text-[11px] text-faint not-italic'>
          {place}
        </span>
        <span className='min-w-0 max-sm:line-clamp-2 max-sm:leading-tight sm:truncate'>
          {genre.name}
        </span>
      </span>
      <span
        className={cn(
          'flex min-w-0 flex-1 items-end border-b-(--poche) pl-0.5',
          fine ? 'gap-px border-b-[1.5px]' : 'gap-0.5 border-b-3 max-sm:gap-px',
        )}
      >
        {genre.books
          .filter((_, i) => i % every === 0)
          .map((book) => (
            <span
              key={book.id}
              className={cn(
                'block shrink-0 transition-[translate,filter] duration-700 ease-soft group-hover/books:-translate-y-1 group-hover/books:brightness-110',
                fine ? 'w-1' : 'w-1.5 max-sm:w-1',
              )}
              style={{
                height: Math.round(
                  spineSize(book).height * (fine ? TALL_FINE : TALL),
                ),
              }}
            >
              <ToneSpine book={book} className='size-full' />
            </span>
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
          {genre.books.length}
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
