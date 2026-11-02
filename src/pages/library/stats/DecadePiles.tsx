import type { CSSProperties } from 'react';
import { cn } from '@/shared/lib/cn';
import { HOVER, useMediaQuery } from '@/shared/lib/useMediaQuery';
import { seedOf } from '@/shared/lib/seed';
import type { byDecade } from './libraryStats';
import { BooksDrawer } from './BooksDrawer';
import { DecadeEnds } from './DecadeEnds';
import { HoverBooks } from './HoverBooks';
import { ToneSpine } from './ToneSpine';
import { useBooksDrawer } from './useBooksDrawer';

// The most books a pile is drawn with; past that, one spine stands for
// several books
const TALLEST = 40;

// A decade written under its pile: in full at a century's turn, otherwise
// by its last two figures
const decadeName = (from: number, older: boolean) =>
  older ? `<${from + 10}` : from % 100 ? `’${String(from).slice(2)}` : from;

// The books by decade, each decade a pile of them lying one on another
// (as a list's pile is), how many over it, a ruler of the years under the
// piles; a decade's books opened to choose from as a month's are
// (HoverBooks); and the oldest book and the newest, ruled off under them
// (DecadeEnds)
export function DecadePiles({
  decades,
}: {
  decades: NonNullable<ReturnType<typeof byDecade>>;
}) {
  const { columns, oldest, newest } = decades;
  const most = Math.max(...columns.map((column) => column.books.length));
  const every = Math.ceil(most / TALLEST);
  const hover = useMediaQuery(HOVER);
  const drawer = useBooksDrawer();
  return (
    <>
      <div
        className='grid items-end gap-x-1.5'
        style={{ gridTemplateColumns: `repeat(${columns.length}, 1fr)` }}
      >
        {columns.map(({ from, older, books }, i) => {
          const name = older ? `Before ${from + 10}` : `The ${from}s`;
          return (
            <HoverBooks
              key={from}
              heading={name}
              books={books}
              side={i < 3 ? 'start' : i > columns.length - 4 ? 'end' : 'middle'}
              hover={hover}
              onOpen={() => drawer.show(name, books)}
              className='items-stretch'
              over={
                <span className='mb-1.5 text-center font-serif text-[13px] text-faint transition-colors duration-500 ease-soft group-hover/books:text-ink'>
                  {books.length || ''}
                </span>
              }
            >
              <span className='flex flex-col items-center gap-px'>
                {books
                  .filter((_, k) => k % every === 0)
                  .map((book, k, shown) => (
                    // Pointed at, the pile loosens: each book lifting the
                    // more the higher it lies, so the pile opens up a touch
                    // from the bottom, and brightens
                    <span
                      key={book.id}
                      className='block h-1.5 transition-[translate,filter] duration-700 ease-soft group-hover/books:translate-y-(--rise) group-hover/books:brightness-110'
                      style={
                        {
                          width: `${70 + seedOf(book.id) * 30}%`,
                          '--rise': `${-Math.min(shown.length - 1 - k, 24) * 0.6}px`,
                        } as CSSProperties
                      }
                    >
                      {/* Set a little off true, as a pile is */}
                      <ToneSpine
                        book={book}
                        className='size-full'
                        style={{
                          translate: `${seedOf(`${book.id}x`) * 6 - 3}%`,
                        }}
                      />
                    </span>
                  ))}
              </span>
            </HoverBooks>
          );
        })}
      </div>
      <div className='relative mt-2 h-8 border-t border-(--fine)'>
        {columns.map(({ from, older }, i) => {
          const left = `${((i + 0.5) / columns.length) * 100}%`;
          const minor = i % 2 === 1 && i !== columns.length - 1;
          return (
            <span key={from}>
              <i
                className='absolute -top-1 h-2 w-px bg-(--fine)'
                style={{ left }}
              />
              <em
                className={cn(
                  'absolute top-2.5 -translate-x-1/2 text-[11px] whitespace-nowrap text-muted not-italic',
                  minor && 'max-sm:hidden',
                )}
                style={{ left }}
              >
                {decadeName(from, older)}
              </em>
            </span>
          );
        })}
      </div>
      <div className='mt-8'>
        <DecadeEnds oldest={oldest} newest={newest} />
      </div>
      {!hover && <BooksDrawer {...drawer} />}
    </>
  );
}
