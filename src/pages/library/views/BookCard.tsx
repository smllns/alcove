import type { Book } from '@/entities/book/types';
import { BookCover } from '@/entities/book/ui/BookCover';
import { cn } from '@/shared/lib/cn';
import { Rating } from '@/shared/ui/Rating';
import { RemoveBook } from './RemoveBook';

export type CardSize = 'S' | 'M' | 'L';

const titleSizes: Record<CardSize, string> = {
  S: 'text-[13px]',
  M: 'text-[15px]',
  L: 'text-lg',
};

// One book in the grid: the cover, then title, author and the reader's
// rating underneath
export function BookCard({ book, size }: { book: Book; size: CardSize }) {
  const author = book.authors.join(', ');
  return (
    <article className='group relative cursor-pointer'>
      <BookCover
        title={book.title}
        author={author}
        url={book.cover?.url}
        // The same picture at every size, so changing it never reloads one
        size='L'
        className='shadow-[0_18px_30px_-16px_rgba(40,28,14,0.45),0_2px_5px_rgba(40,28,14,0.12)] transition-transform duration-700 ease-soft group-hover:-translate-y-1.5'
      />
      {/* Rides up with the cover */}
      <RemoveBook
        book={book}
        className='absolute right-2 top-2 group-hover:-translate-y-1.5'
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
    </article>
  );
}
