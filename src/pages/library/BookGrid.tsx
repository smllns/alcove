import { useEffect } from 'react';
import type { Book } from '@/entities/book/types';
import { useInView } from '@/shared/lib/useInView';
import { Spinner } from '@/shared/ui/Spinner';
import { BookCard } from './BookCard';

type BookGridProps = {
  books: Book[];
  hasMore: boolean;
  loadingMore: boolean;
  loadMore: () => void;
};

// Covers in a responsive grid; the next page loads as the end comes into view
export function BookGrid({
  books,
  hasMore,
  loadingMore,
  loadMore,
}: BookGridProps) {
  const [sentinel, nearEnd] = useInView<HTMLDivElement>();

  useEffect(() => {
    if (nearEnd && hasMore && !loadingMore) loadMore();
  }, [nearEnd, hasMore, loadingMore, loadMore]);

  return (
    <>
      {/* Two columns on phones; wider screens fit as many fixed-width
          columns as there's room for, and a short shelf sits centred */}
      <ul className='grid grid-cols-2 gap-x-5 gap-y-9 sm:grid-cols-[repeat(auto-fit,10.5rem)] sm:justify-center sm:gap-x-7'>
        {books.map((book, i) => (
          <li
            key={book.id}
            className='animate-rise'
            // The first screenful cascades in; later pages just appear
            style={{ animationDelay: `${Math.min(i, 18) * 45}ms` }}
          >
            <BookCard book={book} />
          </li>
        ))}
      </ul>
      <div
        ref={sentinel}
        className='flex h-24 items-center justify-center text-muted'
      >
        {loadingMore && <Spinner />}
      </div>
    </>
  );
}
