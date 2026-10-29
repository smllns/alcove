import type { Book } from '@/entities/book/types';
import { MiniSpine } from '@/entities/book/ui/MiniSpine';
import { cn } from '@/shared/lib/cn';
import { leanClass, leanOf } from './pileLean';

// The most books a pile shows; a longer list's pile goes on up out of
// sight, fading away at the top
const SHOWN = 16;

// A list as a pile of its books lying one on another, each in its cover's
// colour and as thick as its pages, leaning as pileLean has it, loosening
// a touch as its list is pointed at (`group`). The newest on top.
export function ListPile({ books }: { books: Book[] }) {
  const shown = books.slice(0, SHOWN).reverse();
  return (
    <div
      className={cn(
        'list-pile flex flex-col items-center',
        books.length > SHOWN &&
          'mask-[linear-gradient(to_bottom,transparent,black_3.5rem)]',
      )}
    >
      {shown.map((book, i) => (
        <span
          key={book.id}
          className={cn('mt-px block', leanClass)}
          style={leanOf(book.id, shown.length - 1 - i, shown.length)}
        >
          <MiniSpine
            book={book}
            lying
            grow={2.3}
            // A fat book no thicker than a book on a pile looks
            className='list-spine max-h-4'
            pending='var(--spine-pending)'
          />
        </span>
      ))}
    </div>
  );
}
