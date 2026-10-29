import type { Book } from '@/entities/book/types';
import { placePath } from '@/entities/place/names';
import type { Home } from '@/entities/place/types';
import { ShelfFinder } from '../views/ShelfFinder';

// A book looked for by its title or writer among all the reader's books,
// each found shown by its cover with where it is, one picked found there
// (`onFind`)
export function PlacesSearch({
  books,
  homes,
  onFind,
}: {
  books: Book[];
  homes: Home[];
  onFind: (book: Book) => void;
}) {
  const where = (book: Book) => {
    const path = book.copy?.place ? placePath(homes, book.copy.place) : [];
    return path.length
      ? path.map((step) => step.name).join(' · ')
      : 'Not placed yet';
  };
  return (
    <ShelfFinder
      books={books}
      onPick={onFind}
      placeholder='Find a book'
      details={where}
      // On a phone, a whole line of its own
      className='w-56 max-sm:w-full'
    />
  );
}
