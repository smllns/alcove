import type { Book } from '@/entities/book/types';
import { BookLine } from '@/entities/book/ui/BookLine';
import { ownBookLine } from '@/entities/book/ui/ownBookLine';
import { Spinner } from '@/shared/ui/Spinner';
import { BookLink } from './BookLink';
import { FoundPanel, foundRowClass } from './FoundPanel';

// What a search found, as a list dropping down under the search field. On
// a phone, where the keyboard leaves too little of the page in view to
// watch the finds light up in the sky or the grid narrow down; picking one
// opens the book, its cover flying over from the list.
export function SearchResults({
  books,
  search,
  loading,
}: {
  books: Book[];
  search: string;
  loading: boolean;
}) {
  return (
    <FoundPanel>
      {books.length ? (
        <ul>
          {books.map((book) => (
            <li key={book.id}>
              <BookLink id={book.id} className={foundRowClass}>
                <BookLine size='sm' {...ownBookLine(book)} />
              </BookLink>
            </li>
          ))}
        </ul>
      ) : loading ? (
        <div className='flex justify-center py-5 text-muted'>
          <Spinner />
        </div>
      ) : (
        <p className='px-3 py-4 text-sm text-muted'>
          Nothing on your shelves matches “{search}”.
        </p>
      )}
    </FoundPanel>
  );
}
