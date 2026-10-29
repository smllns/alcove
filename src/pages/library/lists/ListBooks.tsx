import { useState, type RefObject } from 'react';
import type { Book } from '@/entities/book/types';
import type { Arranging } from '../places/shelf/arranging';
import { BookGrid } from '../views/BookGrid';
import { ListBar } from './ListBar';
import { NoneFound } from './ListSearch';

// A list's books as covers (`shown`: those found, or all), each opening
// its page; while it's changed (`editing`), each picked by a tap rather
// than opened, the picked ones then taken out together (off the list, not
// the shelves) from the bar at the foot of the screen, and put back if
// need be, going and coming as useListChanges has it
export function ListBooks({
  books,
  shown,
  asked,
  editing,
  frame,
  onTakeOut,
}: {
  // Every book in it, as listedBooks has them
  books: Book[];
  shown: Book[];
  // Something's being looked for
  asked: boolean;
  editing: Arranging;
  // For the books going and coming to be found (useListChanges)
  frame: RefObject<HTMLDivElement | null>;
  // Takes them out, giving back the way to put them back
  onTakeOut: (books: Book[]) => () => void;
}) {
  // Only the books here from the start rise into place; any put in later
  // fade in as useListChanges has it
  const [first] = useState(() => new Set(books.map((book) => book.id)));
  return (
    <div ref={frame}>
      {shown.length ? (
        <BookGrid
          books={shown}
          size='S'
          start
          rise={(book) => first.has(book.id)}
          removable={false}
          picking={editing}
        />
      ) : asked ? (
        <NoneFound />
      ) : (
        <p className='text-[15px] text-muted'>
          {editing.on
            ? 'Nothing in it yet. Find books to put in it.'
            : 'Nothing in it yet. Choose Edit list to put books in it.'}
        </p>
      )}
      <ListBar picking={editing} books={books} onTakeOut={onTakeOut} />
    </div>
  );
}
