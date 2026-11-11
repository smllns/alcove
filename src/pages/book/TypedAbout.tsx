import type { Book } from '@/entities/book/types';
import { Fold } from '@/shared/ui/Fold';
import { aboutTextClass } from './aboutText';
import { TitledSection } from '@/shared/ui/TitledSection';
import { EditionFacts } from './EditionFacts';

// A book the catalogue doesn't have (typed in by hand as wanted, or another
// reader's own, as alcove has it from their shelves): what it's about and
// the card of its facts, as they were told
export function TypedAbout({ book }: { book: Book }) {
  return (
    <>
      {book.description && (
        <TitledSection title='What it’s about'>
          <Fold className={aboutTextClass}>{book.description}</Fold>
        </TitledSection>
      )}
      <EditionFacts book={book} />
    </>
  );
}
