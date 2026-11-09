import type { ReactNode } from 'react';
import type { AddBookState, SimilarBook } from '@/entities/book/types';
import { BookCover } from '@/entities/book/ui/BookCover';
import { paths } from '@/shared/config/paths';
import { cn } from '@/shared/lib/cn';
import { Rating } from '@/shared/ui/Rating';
import { TransitionLink } from '@/shared/ui/TransitionLink';
import { Labelled } from './Labelled';

// A row of books to read: their covers, swiped along, or where the page has
// room for them all side by side, simply laid out in a row. One on the reader's
// shelves already opens its own page, and shows the stars they gave it; any
// other, its page from the catalogue. Each with its writer under it, unless
// they're all one writer's (`byline`, false), as on that writer's page. `grid`:
// laid out in rows of covers at every width, a phone's too, rather than swiped.
// `action`: something to do with a book, on its cover's corner, showing as it's
// pointed at (always, on a touch screen, where nothing is).
export function BookRow({
  label,
  books,
  ours = false,
  byline = true,
  grid = false,
  action,
  className,
}: {
  label?: string;
  books: SimilarBook[];
  // All the reader's own, as the label says: none marked as such
  ours?: boolean;
  byline?: boolean;
  grid?: boolean;
  action?: (book: SimilarBook) => ReactNode;
  className?: string;
}) {
  if (!books.length) return null;
  return (
    <Labelled label={label} className={className}>
      {/* Swiped along within the page's own margins, in line with the
          text above and below it, rather than out to the sheet's edges */}
      <ul
        className={
          grid
            ? 'grid grid-cols-3 gap-x-4 gap-y-6 sm:grid-cols-4 lg:grid-cols-6 xl:gap-x-5'
            : 'flex snap-x gap-4 overflow-x-auto pb-2 scrollbar-none lg:grid lg:grid-cols-6 lg:overflow-visible xl:gap-5'
        }
      >
        {books.map((each) => (
          <li
            key={each.workKey}
            className={cn(
              'group/row relative',
              grid ? 'min-w-0' : 'w-28 shrink-0 snap-start lg:w-auto',
            )}
          >
            <NextBook book={each} marked={!ours} byline={byline} />
            {action && (
              <div className='absolute right-2 top-2 opacity-0 transition-opacity duration-500 ease-soft group-hover/row:opacity-100 focus-within:opacity-100 [@media(hover:none)]:opacity-100'>
                {action(each)}
              </div>
            )}
          </li>
        ))}
      </ul>
    </Labelled>
  );
}

function NextBook({
  book,
  marked,
  byline,
}: {
  book: SimilarBook;
  marked: boolean;
  byline: boolean;
}) {
  const author = book.authors[0];
  const state: AddBookState | undefined = book.bookId
    ? undefined
    : { work: book };
  return (
    <TransitionLink
      to={book.bookId ? paths.book(book.bookId) : paths.work(book.workKey)}
      state={state}
      className='group block'
    >
      <BookCover
        title={book.title}
        author={author}
        url={book.coverUrl}
        className='shadow-[0_10px_18px_-10px_rgb(var(--shade)/calc(0.5*var(--shade-k)))] will-change-transform transition-transform duration-500 ease-soft group-hover:-translate-y-1'
      />
      <span className='mt-2.5 line-clamp-2 font-serif text-[15px] leading-snug text-ink'>
        {book.title}
      </span>
      {byline && author && (
        <span className='mt-0.5 block truncate text-xs text-muted'>
          {author}
        </span>
      )}
      {marked && book.bookId && (
        <span className='mt-1 block text-xs text-faint'>On your shelves</span>
      )}
      {/* The stars the reader gave it, as on their shelves (BookCard) */}
      {book.bookId && book.rating ? (
        <Rating value={book.rating} className='mt-1 flex text-xs' />
      ) : null}
    </TransitionLink>
  );
}
