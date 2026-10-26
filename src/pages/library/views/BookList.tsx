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
  faded,
  opens,
  ...paging
}: {
  books: Book[];
  columns: boolean;
  // Rows rise into place, unless they've already eased in
  rise?: boolean;
  // Books to fade back, so the others stand out
  faded?: (book: Book) => boolean;
  // Where a book leads, if not to its page
  opens?: (book: Book) => string;
} & Paging) {
  return (
    <>
      <ul
        className={cn(
          // One column as wide as the screen, however long a title: it's
          // cut short with an ellipsis rather than widening the column
          'grid grid-cols-[minmax(0,1fr)] gap-x-8 gap-y-1',
          columns ? 'md:grid-cols-2 xl:grid-cols-3' : 'mx-auto max-w-4xl',
        )}
      >
        {books.map((book, i) => (
          <li
            key={book.id}
            {...shelfItem(book.id, i, {
              rise,
              step: 30,
              faded: faded?.(book),
            })}
          >
            <BookRow
              book={book}
              size={columns ? 'md' : 'lg'}
              opens={opens?.(book)}
            />
          </li>
        ))}
      </ul>
      <MoreBooks {...paging} />
    </>
  );
}
