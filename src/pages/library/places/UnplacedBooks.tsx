import { paths } from '@/shared/config/paths';
import { SectionIntro } from '../SectionIntro';
import type { Shelf } from '../useShelf';
import { BookList } from '../views/BookList';

// Places named and books added, but none of them put anywhere yet: the
// books, each opening where its place is chosen
export function UnplacedBooks({ shelf }: { shelf: Shelf }) {
  const books = shelf.all.filter((book) => !book.copy?.place);
  return (
    <>
      <SectionIntro eyebrow='Places' title='Your books aren’t on shelves yet'>
        Open one to choose where it sits. The rest can follow whenever you like.
      </SectionIntro>
      <div className='mt-10 sm:mt-12'>
        <BookList
          books={books}
          columns
          opens={(book) => paths.editBook(book.id, 'copy')}
          {...shelf.paging}
        />
      </div>
    </>
  );
}
