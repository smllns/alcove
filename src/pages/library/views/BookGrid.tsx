import type { Book } from '@/entities/book/types';
import { cn } from '@/shared/lib/cn';
import { BookCard, type CardSize } from './BookCard';
import { MoreBooks, type Paging } from './MoreBooks';
import { shelfItem } from './shelfItem';

// Fixed-width columns, as many as there's room for; a short shelf sits
// centred. Phones get a set number of columns instead.
const columns: Record<CardSize, string> = {
  S: 'grid-cols-3 gap-x-4 gap-y-7 sm:grid-cols-[repeat(auto-fit,7.5rem)] sm:gap-x-6',
  M: 'grid-cols-2 gap-x-5 gap-y-9 sm:grid-cols-[repeat(auto-fit,10.5rem)] sm:gap-x-7',
  L: 'grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-[repeat(auto-fit,14rem)] sm:gap-x-9',
};

// Covers in a grid, small, medium or large
export function BookGrid({
  books,
  size,
  rise = true,
  ...paging
}: {
  books: Book[];
  size: CardSize;
  // Cards rise into place, unless they've already eased in
  rise?: boolean;
} & Paging) {
  return (
    <>
      <ul className={cn('grid sm:justify-center', columns[size])}>
        {books.map((book, i) => (
          <li key={book.id} {...shelfItem(book.id, i, { rise, step: 45 })}>
            <BookCard book={book} size={size} />
          </li>
        ))}
      </ul>
      <MoreBooks {...paging} />
    </>
  );
}
