import { Loading } from '@/shared/ui/Loading';
import { SectionIntro } from '../SectionIntro';
import type { Shelf } from '@/entities/book/useShelf';
import { UnplacedShelf } from './shelf/UnplacedShelf';

// Places named and books added, but none of them put anywhere yet: the
// books, to pick and put where they go (UnplacedShelf)
export function UnplacedBooks({ shelf }: { shelf: Shelf }) {
  const books = shelf.all.filter((book) => !book.copy?.place);
  return (
    <>
      <SectionIntro eyebrow='Places' title='Your books aren’t on shelves yet'>
        Hold a book, or tap Arrange, to pick some and put them where they sit.
      </SectionIntro>
      <div className='mt-10 sm:mt-12'>
        {shelf.complete ? <UnplacedShelf books={books} /> : <Loading />}
      </div>
    </>
  );
}
