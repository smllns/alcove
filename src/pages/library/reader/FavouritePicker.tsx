import { useState } from 'react';
import { searchable } from '@/entities/book/matches';
import { BookLine } from '@/entities/book/ui/BookLine';
import type { ReaderBook } from '@/entities/reader/types';
import { Modal } from '@/shared/ui/Modal';
import { dialogClass } from '@/shared/ui/surfaces';
import { BookSearch } from '@/widgets/book-search';

// The reader's own books to choose a favourite from (`books`, those not
// chosen yet), found by title or writer as they type; one tapped is
// handed to `onPick`
export function FavouritePicker({
  open,
  books,
  onPick,
  onClose,
}: {
  open: boolean;
  books: ReaderBook[];
  onPick: (id: string) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState('');
  const words = searchable(query.trim());
  const found = words
    ? books.filter((book) =>
        searchable(`${book.title} ${book.authors.join(' ')}`).includes(words),
      )
    : books;
  return (
    <Modal
      open={open}
      onClose={onClose}
      onClosed={() => setQuery('')}
      className={dialogClass}
    >
      <div className='flex flex-col gap-5 p-6 sm:p-7'>
        <h2 className='font-serif text-2xl tracking-[-0.01em]'>
          Choose a favourite
        </h2>
        <BookSearch
          grows={false}
          value={query}
          onChange={setQuery}
          found={words ? found.length : undefined}
          placeholder='Find one of your books'
          focus
        />
        <ul className='-mx-3 flex max-h-[min(60vh,28rem)] flex-col overflow-y-auto'>
          {found.map((book) => (
            <li key={book.id}>
              <button
                type='button'
                onClick={() => onPick(book.id)}
                className='flex w-full cursor-pointer items-center rounded-xl px-3 py-2 text-left transition-colors duration-300 ease-soft hover:bg-ink/6 focus-visible:bg-ink/6 focus-visible:outline-none'
              >
                <BookLine
                  size='sm'
                  title={book.title}
                  byline={book.authors.join(', ') || 'Unknown author'}
                  coverUrl={book.coverUrl}
                />
              </button>
            </li>
          ))}
          {!found.length && (
            <li className='px-3 py-6 text-center text-sm text-muted'>
              {words ? 'None of your books by that name.' : 'No books yet.'}
            </li>
          )}
        </ul>
      </div>
    </Modal>
  );
}
