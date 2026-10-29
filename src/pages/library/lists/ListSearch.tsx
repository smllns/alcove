import { workOfBook } from '@/entities/book/catalogueBook';
import type { AddBookState, Book } from '@/entities/book/types';
import { paths } from '@/shared/config/paths';
import { useMediaQuery } from '@/shared/lib/useMediaQuery';
import { useTransitionNavigate } from '@/shared/lib/useTransitionNavigate';
import { BookSearch } from '../views/BookSearch';
import { ShelfFinder } from '../views/ShelfFinder';
import type { useListSearch } from './useListSearch';

const PLACEHOLDER = 'Find in this list';

// The field to look for a book in a list with. On a wide screen it narrows
// the covers beside it down to those found (useListSearch), saying how
// many; narrower, where the covers lie under the keyboard out of sight,
// those found show under the field as the search over everything shows
// them, `books` among the list's, one picked opening its page.
export function ListSearch({
  search,
  books,
  className,
}: {
  search: ReturnType<typeof useListSearch<unknown>>;
  books: Book[];
  className?: string;
}) {
  const narrow = useMediaQuery('(max-width: 1023px)');
  const navigate = useTransitionNavigate();
  const open = (book: Book) => {
    const work = workOfBook(book);
    void (work
      ? navigate(paths.work(work.workKey), 'forward', {
          state: { work } satisfies AddBookState,
        })
      : navigate(paths.book(book.id)));
  };
  return narrow ? (
    <ShelfFinder
      books={books}
      onPick={open}
      placeholder={PLACEHOLDER}
      details={(book) => (workOfBook(book) ? 'Not in your library' : '')}
      grows={false}
      className={className}
    />
  ) : (
    <BookSearch
      grows={false}
      value={search.query}
      onChange={search.setQuery}
      found={search.asked ? search.found.length : undefined}
      placeholder={PLACEHOLDER}
      className={className}
    />
  );
}

// Nothing in the list goes by what's typed
export function NoneFound() {
  return (
    <p className='animate-arrive text-[15px] text-muted'>
      Nothing in this list by that name.
    </p>
  );
}
