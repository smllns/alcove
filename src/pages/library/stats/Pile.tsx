import type { CSSProperties } from 'react';
import type { Book } from '@/entities/book/types';
import { cn } from '@/shared/lib/cn';
import { seedOf } from '@/shared/lib/seed';
import { ToneSpine } from '@/widgets/book-cards';

// Books lying one on another, the top one first, as a list's pile is: each
// in its cover's colour, its own width, set a little off true, as thick as
// `thickness` has it (or all alike). Pointed at (its group's
// `group-hover/books`), the pile loosens: each book lifting the more the
// higher it lies, so it opens up a touch from the bottom, and brightens.
export function Pile({
  books,
  thickness,
}: {
  books: Book[];
  thickness?: (book: Book) => number;
}) {
  return (
    <span className='flex flex-col items-center gap-px'>
      {books.map((book, k) => (
        <span
          key={book.id}
          className={cn(
            'block transition-[translate,filter] duration-700 ease-soft group-hover/books:translate-y-(--rise) group-hover/books:brightness-110',
            !thickness && 'h-1.5',
          )}
          style={
            {
              width: `${70 + seedOf(book.id) * 30}%`,
              height: thickness?.(book),
              '--rise': `${-Math.min(books.length - 1 - k, 24) * 0.6}px`,
            } as CSSProperties
          }
        >
          <ToneSpine
            book={book}
            className='size-full'
            style={{ translate: `${seedOf(`${book.id}x`) * 6 - 3}%` }}
          />
        </span>
      ))}
    </span>
  );
}

// How many books a pile holds, written over it, high enough that the top
// book, lifting as its group is pointed at, never reaches it, and darkening
// then too; none written over an empty one
export function PileCount({ count }: { count: number }) {
  return (
    <span className='mb-4 text-center font-serif text-[0.8125rem] text-faint transition-colors duration-500 ease-soft group-hover/books:text-ink'>
      {count || ''}
    </span>
  );
}
