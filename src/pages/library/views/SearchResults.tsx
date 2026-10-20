import type { Book } from '@/entities/book/types';
import { BookLine } from '@/entities/book/ui/BookLine';
import { Spinner } from '@/shared/ui/Spinner';
import { cn } from '@/shared/lib/cn';
import { raisedClass } from '@/shared/ui/surfaces';

// What a search found, as a list dropping down under the search field. For
// the sky on a phone, where the keyboard leaves too little of it in view
// to watch the finds light up; picking one flies the sky over to it.
export function SearchResults({
  books,
  search,
  loading,
  onPick,
}: {
  books: Book[];
  search: string;
  loading: boolean;
  onPick: (book: Book) => void;
}) {
  return (
    <div
      className={cn(
        'absolute inset-x-0 top-full z-20 mt-2 max-h-[min(50dvh,26rem)] animate-rise overflow-y-auto overscroll-contain rounded-3xl p-1.5',
        raisedClass,
      )}
    >
      {books.length ? (
        <ul>
          {books.map((book) => (
            <li key={book.id}>
              <button
                type='button'
                onClick={() => onPick(book)}
                className='flex w-full cursor-pointer items-center gap-3 rounded-2xl p-2 text-left transition-colors duration-300 ease-soft hover:bg-ink/4 active:bg-ink/6'
              >
                <BookLine
                  size='sm'
                  title={book.title}
                  byline={book.authors.join(', ')}
                  coverUrl={book.cover?.url}
                />
              </button>
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
    </div>
  );
}
