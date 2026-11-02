import { SectionIntro } from '../SectionIntro';
import type { Book } from '@/entities/book/types';
import { UnplacedShelf } from './shelf/UnplacedShelf';

// Places named and books added, but none of them put anywhere yet: the
// books, to pick and put where they go (UnplacedShelf). `books`: all the
// reader's physical books
export function UnplacedBooks({ books }: { books: Book[] }) {
  const unplaced = books.filter((book) => !book.copy?.place);
  return (
    <>
      <SectionIntro eyebrow='Places' title='Your books aren’t on shelves yet'>
        Hold a book, or tap Arrange, to pick some and put them where they sit.
      </SectionIntro>
      <div className='mt-10 sm:mt-12'>
        <UnplacedShelf books={unplaced} />
      </div>
    </>
  );
}
