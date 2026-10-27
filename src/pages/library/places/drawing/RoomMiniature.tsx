import type { CSSProperties } from 'react';
import { cn } from '@/shared/lib/cn';
import type { Book } from '@/entities/book/types';
import { useSpineColour } from '@/entities/book/coverTone';
import { spineSize } from '@/entities/book/spine';
import type { UnitBooks } from '../arrange';

// How much smaller than in its room a book is in the plan of the home
const SCALE = 1 / 2.5;
// The most books a shelf shows in the plan
const SHOWN = 28;

// A book drawn small, in its cover's colour, quietened into the drawing
// (styles/places.css)
function MiniSpine({
  book,
  lying,
  grow = 1,
}: {
  book: Book;
  lying?: boolean;
  grow?: number;
}) {
  const colour = useSpineColour(book);
  const { width, height } = spineSize(book);
  const [w, h] = [
    Math.max(2, Math.round(width * SCALE * grow)),
    Math.round(height * SCALE * grow),
  ];
  return (
    <span
      className='mini-spine block shrink-0 rounded-[1px]'
      style={
        {
          width: lying ? h : w,
          height: lying ? w : h,
          '--tone': colour,
        } as CSSProperties
      }
    />
  );
}

// Books lying one on another, as many as show; `grow` times as large
export function MiniPile({
  books,
  grow = 1,
}: {
  books: Book[];
  grow?: number;
}) {
  return (
    <div className='flex flex-col-reverse items-start'>
      {books.slice(0, 6).map((book, i) => (
        <span key={book.id} style={{ marginLeft: ((i * 3) % 5) * grow }}>
          <MiniSpine book={book} lying grow={grow} />
        </span>
      ))}
    </div>
  );
}

// How many books to a pile, and the most piles shown
const PILE = 5;
const PILES = 4;

// Books lying in piles side by side, a pile to every few, as many piles
// as fit (as wide as `className` lets them), those that don't wrapping
// out of sight
export function MiniPiles({
  books,
  grow = 1,
  className,
}: {
  books: Book[];
  grow?: number;
  className?: string;
}) {
  const piles = Array.from(
    { length: Math.min(PILES, Math.ceil(books.length / PILE)) },
    (_, i) => books.slice(i * PILE, (i + 1) * PILE),
  );
  return (
    <span
      className={cn(
        'flex h-9 min-w-0 flex-wrap items-end gap-x-2 overflow-hidden',
        className,
      )}
    >
      {piles.map((pile) => (
        <span key={pile[0].id} className='flex h-9 flex-col justify-end'>
          <MiniPile books={pile} grow={grow} />
        </span>
      ))}
    </span>
  );
}

// A bookcase drawn small, in the plan of its home: its shelves, and the
// colours of the books on each
export function MiniBookcase({ shelves, loose }: UnitBooks) {
  return (
    <div className='flex shrink-0 flex-col items-start'>
      {loose.length > 0 && <MiniPile books={loose} />}
      <div className='bookcase bookcase-mini self-stretch'>
        {(shelves.length ? shelves : [{ books: [] }]).map(({ books }, i) => (
          <div
            key={i}
            className='bookcase-shelf flex h-11 min-w-16 items-end gap-px px-1'
          >
            {books.slice(0, SHOWN).map((book) => (
              <MiniSpine key={book.id} book={book} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
