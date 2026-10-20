import { formatLabel } from '@/entities/book/formats';
import type { Book } from '@/entities/book/types';
import { BookLine } from '@/entities/book/ui/BookLine';
import { cn } from '@/shared/lib/cn';
import { Rating } from '@/shared/ui/Rating';
import { publishedIn } from './order';
import { RemoveBook } from './RemoveBook';

// One book in the list: a small cover, then its title, author and the odd
// detail
export function BookRow({
  book,
  size = 'md',
}: {
  book: Book;
  size?: 'md' | 'lg';
}) {
  const author = book.authors.join(', ');
  const rating = book.copy?.rating;
  const details = [
    publishedIn(book),
    book.format && formatLabel(book.format),
    rating ? <Rating value={rating} /> : null,
  ];

  return (
    <article
      className={cn(
        // Hovered, the row lifts into a card of its own
        'group flex cursor-pointer items-center gap-4 rounded-2xl p-2.5 ring-1 ring-transparent transition-[background-color,box-shadow] duration-500 ease-soft hover:bg-surface/90 hover:shadow-[0_16px_34px_-22px_rgba(40,28,14,0.5)] hover:ring-line/70 dark:hover:bg-ink/6 dark:hover:shadow-[0_16px_34px_-20px_rgba(0,0,0,0.7)]',
        size === 'lg' && 'sm:p-3.5',
      )}
    >
      <BookLine
        size={size}
        title={book.title}
        byline={author}
        coverUrl={book.cover?.url}
        details={details}
      />
      <RemoveBook book={book} className='shrink-0' />
    </article>
  );
}
