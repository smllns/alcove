import { useRef, useState } from 'react';
import { bookMatches } from '@/entities/book/matches';
import type { Book } from '@/entities/book/types';
import { BookLine } from '@/entities/book/ui/BookLine';
import { placePath } from '@/entities/place/names';
import type { Home } from '@/entities/place/types';
import { Popover } from '@/shared/ui/Popover';
import { BookSearch } from '../views/BookSearch';

// The most books found shown at once
const SHOWN = 8;

// A book looked for by its title or writer among all the reader's books,
// each found shown by its cover with where it is, one picked found there (`onFind`)
export function PlacesSearch({
  books,
  homes,
  onFind,
}: {
  books: Book[];
  homes: Home[];
  onFind: (book: Book) => void;
}) {
  const field = useRef<HTMLLabelElement>(null);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const asked = query.trim();
  const found = asked
    ? books.filter((book) => bookMatches(book, asked)).slice(0, SHOWN)
    : [];
  const where = (book: Book) => {
    const path = book.copy?.place ? placePath(homes, book.copy.place) : [];
    return path.length
      ? path.map((step) => step.name).join(' · ')
      : 'Not placed yet';
  };

  return (
    <>
      <BookSearch
        ref={field}
        value={query}
        onChange={(next) => {
          setQuery(next);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder='Find a book'
        // On a phone, folded to its icon until it's tapped open
        className='w-56 max-sm:w-10 max-sm:overflow-hidden max-sm:focus-within:w-52'
      />
      <Popover
        open={open && Boolean(asked)}
        anchor={field}
        width={340}
        onClose={() => setOpen(false)}
      >
        <div className='min-h-0 overflow-y-auto overscroll-contain p-1.5'>
          {found.map((book) => (
            <button
              key={book.id}
              type='button'
              onClick={() => {
                setOpen(false);
                setQuery('');
                onFind(book);
              }}
              className='group flex w-full cursor-pointer rounded-lg px-2.5 py-2 text-left transition-colors duration-300 ease-soft hover:bg-ink/6'
            >
              <BookLine
                title={book.title}
                byline={book.authors.join(', ')}
                coverUrl={book.cover?.url}
                bookId={book.id}
                details={[where(book)]}
                size='sm'
              />
            </button>
          ))}
          {!found.length && (
            <p className='px-3 py-3 text-sm text-muted'>
              No book by that name.
            </p>
          )}
        </div>
      </Popover>
    </>
  );
}
