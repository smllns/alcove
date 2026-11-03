import type { Book } from '@/entities/book/types';
import { cn } from '@/shared/lib/cn';
import { counted } from '@/shared/lib/plural';
import { HOVER, useMediaQuery } from '@/shared/lib/useMediaQuery';
import { pagesIn, pagesOf, type extremes } from './libraryStats';
import { BookEnds } from './BookEnds';
import { BooksDrawer } from './BooksDrawer';
import { HoverBooks } from './HoverBooks';
import { sideAt } from './cardSide';
import { Pile, PileCount } from './Pile';
import { thinned } from './piles';
import { useBooksDrawer } from './useBooksDrawer';

// How high the highest pile stands, and how thin a book may lie in one
const HIGHEST = 150;
const THINNEST = 2;

// A book's pages as its end of the span shows them, the word small
const pagesLarge = (book: Book) => (
  <>
    {book.pages!.toLocaleString('en')}
    <span className='ml-1 text-sm text-muted'>pages</span>
  </>
);

// A pile's span of pages
type Band = NonNullable<ReturnType<typeof extremes>>['piles'][number];

const pileName = ({ from, more }: Band) =>
  more
    ? `${from} pages and more`
    : from
      ? `${from}–${from + 100} pages`
      : 'Under 100 pages';

// The books by their length, a pile for each hundred pages, each book lying
// in it as thick as its pages, how many over it (as the decades' piles are),
// a ruler of the pages under the piles, marked where they meet, and on it,
// in gold, where an average book falls; a pile's books opened to choose
// from as a decade's are (HoverBooks), the slimmer first, each with its
// pages; and the slimmest book and the thickest, ruled off under them as
// the decades' ends are (BookEnds)
export function LengthPiles({
  found,
}: {
  found: NonNullable<ReturnType<typeof extremes>>;
}) {
  const { piles, average, shortest, longest } = found;
  const hover = useMediaQuery(HOVER);
  const drawer = useBooksDrawer();
  const drawn = thinned(piles.map((pile) => pile.books));
  const deepest = Math.max(...drawn.map(pagesIn));
  const scale = Math.min(1 / 90, HIGHEST / deepest);
  // The ruler's marks, a hundred pages apart, where the piles meet: from
  // the first pile's start to the last one's end (none for a last pile
  // that takes every longer book)
  const last = piles.at(-1)!;
  const marks = [
    ...piles.map((pile) => pile.from),
    ...(last.more ? [] : [last.from + 100]),
  ];
  // Where the average falls along the ruler, the piles a hundred pages each
  const at = Math.min(
    100,
    ((average - piles[0].from) / 100 / piles.length) * 100,
  );
  return (
    <>
      <div
        className='grid items-end gap-x-1.5'
        style={{ gridTemplateColumns: `repeat(${piles.length}, 1fr)` }}
      >
        {piles.map((pile, i) => (
          <HoverBooks
            key={pile.from}
            heading={pileName(pile)}
            books={pile.books}
            side={sideAt(i, piles.length)}
            hover={hover}
            onOpen={() => drawer.show(pileName(pile), pile.books)}
            detail={pagesOf}
            className='items-stretch'
            over={<PileCount count={pile.books.length} />}
          >
            {/* The slimmest on top, the thickest at the bottom */}
            <Pile
              books={drawn[i]}
              thickness={(book) =>
                Math.max(THINNEST, Math.round(book.pages! * scale))
              }
            />
          </HoverBooks>
        ))}
      </div>
      <div className='relative mt-2 h-14 border-t border-(--fine)'>
        {marks.map((pages, i) => {
          const left = `${(i / piles.length) * 100}%`;
          return (
            <span key={pages}>
              <i
                className='absolute -top-1 h-2 w-px bg-(--fine)'
                style={{ left }}
              />
              <em
                className={cn(
                  'absolute top-2.5 text-[11px] whitespace-nowrap text-muted not-italic',
                  // The ends kept within the ruler
                  i === 0
                    ? ''
                    : i === marks.length - 1 && !last.more
                      ? '-translate-x-full'
                      : '-translate-x-1/2',
                  i % 2 === 1 && i !== marks.length - 1 && 'max-sm:hidden',
                )}
                style={{ left }}
              >
                {pages}
              </em>
            </span>
          );
        })}
        {/* The average, a gold mark across the ruler and its pages under it */}
        <i
          className='absolute -top-2 h-4 w-0.5 -translate-x-1/2 rounded-full bg-gold'
          style={{ left: `${at}%` }}
        />
        <em
          className='absolute top-8 -translate-x-1/2 font-serif text-[13px] whitespace-nowrap text-ink-soft not-italic'
          style={{
            left: `clamp(4.5rem, ${at}%, calc(100% - 4.5rem))`,
          }}
        >
          average · {counted(average, 'page')}
        </em>
      </div>
      <div className='mt-8'>
        <BookEnds
          first={{ kind: 'The shortest', book: shortest }}
          last={{ kind: 'The longest', book: longest }}
          value={pagesLarge}
          measure={counted(longest.pages! - shortest.pages!, 'page')}
        />
      </div>
      {!hover && <BooksDrawer {...drawer} detail={pagesOf} />}
    </>
  );
}
