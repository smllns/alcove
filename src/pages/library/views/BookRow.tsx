import { Star } from 'lucide-react';
import { formatLabel } from '@/entities/book/formats';
import type { Book } from '@/entities/book/types';
import { BookLine } from '@/entities/book/ui/BookLine';
import { halves } from '@/shared/lib/halves';
import { RemoveBook } from './RemoveBook';

// One book in the list: a small cover, then its title, author and the odd
// detail
export function BookRow({ book }: { book: Book }) {
  const author = book.authors.join(', ');
  const rating = book.copy?.rating;
  const details = [
    book.publishedYear,
    book.format && formatLabel(book.format),
    rating ? (
      <span className='inline-flex items-center gap-0.5 text-ink-soft'>
        <Star size={11} className='fill-accent text-accent' />
        {halves(rating)}
      </span>
    ) : null,
  ];

  return (
    <article className='group flex items-center gap-4 rounded-2xl p-2.5 transition-colors duration-500 ease-soft hover:bg-surface/70'>
      <BookLine
        title={book.title}
        byline={author}
        coverUrl={book.cover?.url}
        details={details}
      />
      <RemoveBook book={book} className='shrink-0' />
    </article>
  );
}
