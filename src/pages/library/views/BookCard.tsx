import type { Book } from '@/entities/book/types';
import { BookCover } from '@/entities/book/ui/BookCover';
import { cn } from '@/shared/lib/cn';
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
// rating underneath, all opening the book's page
export function BookCard({ book, size }: { book: Book; size: CardSize }) {
  const author = book.authors.join(', ');
  return (
    <article className='group relative'>
      <BookLink id={book.id} className='block'>
        <BookCover
          title={book.title}
          author={author}
          url={book.cover?.url}
          bookId={book.id}
          // The same picture at every size, so changing it never reloads one
          size='L'
          className='shadow-[0_18px_30px_-16px_rgb(var(--shade)/calc(0.45*var(--shade-k))),0_2px_5px_rgb(var(--shade)/calc(0.12*var(--shade-k)))] transition-transform duration-700 ease-soft group-hover:-translate-y-1.5'
        />
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
        {book.copy?.rating ? (
          <Rating value={book.copy.rating} className='mt-1 text-xs' />
        ) : null}
      </BookLink>
      {/* Rides up with the cover */}
      <RemoveBook
        book={book}
        className='absolute right-2 top-2 group-hover:-translate-y-1.5'
      />
    </article>
  );
}
