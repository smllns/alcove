import type { ReactNode } from 'react';
import type { Book, CatalogueWork } from '@/entities/book/types';
import { cn } from '@/shared/lib/cn';
import { ListFinder } from './ListFinder';
import { ListSearch } from './ListSearch';
import type { useListSearch } from './useListSearch';

// Looking for a book in a list, or, while it's changed (`editing`), for
// books to put in it: the one field fading into the other in its place.
// Nothing to look for in a list with nothing in it, until it's changed.
export function ListLookup({
  search,
  editing,
  books,
  shelf,
  onBook,
  onWork,
  focus,
}: {
  search: ReturnType<typeof useListSearch<Book>>;
  editing: boolean;
  // The books in the list, and every book of the reader's
  books: Book[];
  shelf: Book[];
  // A book found to put in: one of the reader's, or one from the catalogue
  onBook: (book: Book) => void;
  onWork: (work: CatalogueWork) => void;
  // The cursor in the field for books to put in as it opens (a list just
  // begun)
  focus?: boolean;
}) {
  if (!editing && !books.length) return null;
  return (
    <div className='grid'>
      <InPlace shown={!editing}>
        <ListSearch search={search} books={books} className='w-full' />
      </InPlace>
      <InPlace shown={editing}>
        <ListFinder
          shelf={shelf}
          inList={books}
          onBook={onBook}
          onWork={onWork}
          focus={focus}
          className='w-full'
        />
      </InPlace>
    </div>
  );
}

// One of two things standing in the same place, the one shown fading in
// as the other fades away, out of reach while it's hidden
function InPlace({ shown, children }: { shown: boolean; children: ReactNode }) {
  return (
    <div
      inert={!shown}
      className={cn(
        'transition-[opacity,filter] duration-500 ease-soft [grid-area:1/1]',
        shown ? 'opacity-100' : 'pointer-events-none opacity-0 blur-[2px]',
      )}
    >
      {children}
    </div>
  );
}
