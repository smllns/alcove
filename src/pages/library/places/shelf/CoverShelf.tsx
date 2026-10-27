import type { Book } from '@/entities/book/types';
import { cn } from '@/shared/lib/cn';
import { ShelfBook } from './ShelfBook';

// Books standing face out on a shelf, as many to a row as the shelf is
// wide, four on a phone (each: ShelfBook)
export function CoverShelf({
  books,
  className,
}: {
  books: Book[];
  className?: string;
}) {
  return (
    <ul
      className={cn(
        // On a phone four to a row, as large as that lets them be, a last
        // row not full in the middle
        'flex flex-wrap items-end gap-x-3 gap-y-5 max-sm:justify-center',
        className,
      )}
    >
      {books.map((book) => (
        <ShelfBook key={book.id} book={book} />
      ))}
    </ul>
  );
}
