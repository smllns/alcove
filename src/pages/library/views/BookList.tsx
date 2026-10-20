import type { Book } from '@/entities/book/types';
import { cn } from '@/shared/lib/cn';
import { BookRow } from './BookRow';
import { MoreBooks, type Paging } from './MoreBooks';
import { shelfItem } from './shelfItem';

// Books as rows, in one column or in as many as fit
export function BookList({
  books,
  columns,
  rise = true,
  ...paging
}: {
  books: Book[];
  columns: boolean;
  // Rows rise into place, unless they've already eased in
  rise?: boolean;
} & Paging) {
  return (
    <>
      <ul
        className={cn(
          // One column as wide as the screen, however long a title: it's
          // cut short with an ellipsis rather than widening the column
          'grid grid-cols-[minmax(0,1fr)] gap-x-8 gap-y-1',
          columns ? 'md:grid-cols-2 xl:grid-cols-3' : 'mx-auto max-w-3xl',
        )}
      >
        {books.map((book, i) => (
          <li key={book.id} {...shelfItem(book.id, i, { rise, step: 30 })}>
            <BookRow book={book} />
          </li>
        ))}
      </ul>
      <MoreBooks {...paging} />
    </>
  );
}
