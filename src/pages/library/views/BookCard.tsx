import { workOfBook } from '@/entities/book/catalogueBook';
import type { Book } from '@/entities/book/types';
import { BookCover } from '@/entities/book/ui/BookCover';
import { cn } from '@/shared/lib/cn';
import { PickMark } from '@/shared/ui/PickMark';
import { Rating } from '@/shared/ui/Rating';
import { BookLink } from './BookLink';
import { RemoveBook } from './RemoveBook';

export type CardSize = 'S' | 'M' | 'L';

const titleSizes: Record<CardSize, string> = {
  S: 'text-[13px]',
  M: 'text-[15px]',
  L: 'text-lg',
};

// One book in the grid: the cover, then title, author and the reader's
// rating underneath, all opening the book's page, and a × to take it off
// the shelves, unless not `removable`. While books are being picked
// (`picked` given), it's ringed and lifted once picked, its mark filled,
// and lifted by nothing else: books gliding under the pointer would lift
// and drop.
export function BookCard({
  book,
  size,
  removable = true,
  picked,
}: {
  book: Book;
  size: CardSize;
  removable?: boolean;
  picked?: boolean;
}) {
  const author = book.authors.join(', ');
  const picking = picked !== undefined;
  // One from the catalogue, not on the shelves (kept in a list)
  const work = workOfBook(book);
  return (
    <article className='group relative'>
      <BookLink
        id={book.id}
        work={work}
        aria-pressed={picked}
        draggable={!picking}
        className='block'
      >
        <BookCover
          title={book.title}
          author={author}
          url={book.cover?.url}
          bookId={book.id}
          // The same picture at every size, so changing it never reloads one
          size='L'
          className={cn(
            'shadow-[0_18px_30px_-16px_rgb(var(--shade)/calc(0.45*var(--shade-k))),0_2px_5px_rgb(var(--shade)/calc(0.12*var(--shade-k)))] transition-[translate,box-shadow] duration-700 ease-soft',
            picking
              ? picked &&
                  '-translate-y-1.5 ring-2 ring-ink ring-offset-3 ring-offset-surface'
              : 'group-hover:-translate-y-1.5',
          )}
        >
          {picking && <PickMark picked={picked} />}
        </BookCover>
        <h3
          className={cn(
            'mt-3 line-clamp-2 font-serif leading-snug tracking-[-0.01em]',
            titleSizes[size],
          )}
        >
          {book.title}
        </h3>
        {author && (
          <p className='mt-0.5 line-clamp-1 text-xs text-muted'>{author}</p>
        )}
        {work && (
          <p className='mt-0.5 text-xs text-faint'>Not in your library</p>
        )}
        {book.copy?.rating ? (
          <Rating value={book.copy.rating} className='mt-1 text-xs' />
        ) : null}
      </BookLink>
      {/* Rides up with the cover */}
      {removable && !picking && (
        <RemoveBook
          book={book}
          className='absolute right-2 top-2 group-hover:-translate-y-1.5'
        />
      )}
    </article>
  );
}
