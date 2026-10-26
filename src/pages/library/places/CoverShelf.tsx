import type { Book } from '@/entities/book/types';
import { BookCover } from '@/entities/book/ui/BookCover';
import { cn } from '@/shared/lib/cn';
import { raisedClass } from '@/shared/ui/surfaces';
import { BookLink } from '../views/BookLink';

// Books standing face out on a shelf, as many to a row as the shelf is
// wide. Pointed at, a book comes up a little
// with its title and author under it, and opens its page, its cover
// flying over to it.
export function CoverShelf({
  books,
  className,
}: {
  books: Book[];
  className?: string;
}) {
  return (
    <ul className={cn('flex flex-wrap items-end gap-x-3 gap-y-5', className)}>
      {books.map((book) => (
        <li key={book.id} className='group relative'>
          <BookLink
            id={book.id}
            aria-label={`${book.title}, ${book.authors.join(', ')}`}
            className='block'
          >
            <BookCover
              title={book.title}
              author={book.authors.join(', ')}
              url={book.cover?.url}
              bookId={book.id}
              // As in the grid, so most often in already
              size='L'
              className='w-16 shadow-[0_8px_14px_-10px_rgb(var(--shade)/calc(0.5*var(--shade-k)))] transition-transform duration-500 ease-soft group-hover:-translate-y-1.5 sm:w-18'
            />
          </BookLink>
          <div
            aria-hidden
            className={cn(
              'pointer-events-none absolute left-1/2 top-full z-10 mt-2 w-48 -translate-x-1/2 rounded-xl px-3 py-2 text-center opacity-0 transition-opacity duration-300 ease-soft group-hover:opacity-100',
              raisedClass,
            )}
          >
            <p className='line-clamp-2 font-serif text-sm leading-snug text-ink'>
              {book.title}
            </p>
            <p className='mt-0.5 line-clamp-1 text-xs text-muted'>
              {book.authors.join(', ')}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
