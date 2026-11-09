import type { Book } from '@/entities/book/types';
import { Fold } from '@/shared/ui/Fold';
import { aboutTextClass } from './aboutText';
import { BookSection } from './BookSection';
import { EditionFacts } from './EditionFacts';

// A book wanted that the catalogue doesn't have, typed in by hand: what
// it's about and the card of its facts, as the reader told them
export function TypedAbout({ book }: { book: Book }) {
  return (
    <>
      {book.description && (
        <BookSection title='What it’s about'>
          <Fold className={aboutTextClass}>{book.description}</Fold>
        </BookSection>
      )}
      <EditionFacts book={book} />
    </>
  );
}
