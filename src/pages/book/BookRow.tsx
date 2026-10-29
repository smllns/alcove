import type { AddBookState, SimilarBook } from '@/entities/book/types';
import { BookCover } from '@/entities/book/ui/BookCover';
import { paths } from '@/shared/config/paths';
import { TransitionLink } from '@/shared/ui/TransitionLink';
import { Labelled } from './Labelled';

// A row of books to read: their covers, swiped along, or where the page has
// room for them all side by side, simply laid out in a row. One on the
// reader's shelves already opens its own page; any other, its page from
// the catalogue.
export function BookRow({
  label,
  books,
  ours = false,
  className,
}: {
  label: string;
  books: SimilarBook[];
  // All the reader's own, as the label says: none marked as such
  ours?: boolean;
  className?: string;
}) {
  if (!books.length) return null;
  return (
    <Labelled label={label} className={className}>
      {/* Swiped along within the page's own margins, in line with the
          text above and below it, rather than out to the sheet's edges */}
      <ul className='flex snap-x gap-4 overflow-x-auto pb-2 scrollbar-none lg:grid lg:grid-cols-6 lg:overflow-visible xl:gap-5'>
        {books.map((each) => (
          <li key={each.workKey} className='w-28 shrink-0 snap-start lg:w-auto'>
            <NextBook book={each} marked={!ours} />
          </li>
        ))}
      </ul>
    </Labelled>
  );
}

function NextBook({ book, marked }: { book: SimilarBook; marked: boolean }) {
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
      {author && (
        <span className='mt-0.5 block truncate text-xs text-muted'>
          {author}
        </span>
      )}
      {marked && book.bookId && (
        <span className='mt-1 block text-xs text-faint'>On your shelves</span>
      )}
    </TransitionLink>
  );
}
