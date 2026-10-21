import type { Book } from '@/entities/book/types';
import { plural } from '@/shared/lib/plural';
import { BookReview } from './BookReview';
import { BookSection } from './BookSection';
import { StickyNotes } from './StickyNotes';

// What the reader has written about the book: their review (once there is
// one, or one's being started) and their notes (always, so there's
// somewhere to write the first)
export function BookPassages({
  book,
  reviewing,
  onReviewStarted,
}: {
  book: Book;
  reviewing: boolean;
  onReviewStarted: () => void;
}) {
  const notes = book.copy?.notes ?? [];
  return (
    <>
      <BookReview
        book={book}
        starting={reviewing}
        onStarted={onReviewStarted}
      />
      <BookSection title={plural(notes.length, 'Note')}>
        <StickyNotes book={book} />
      </BookSection>
    </>
  );
}
