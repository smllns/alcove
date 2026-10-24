import { useSimilarBooks } from '@/entities/book/catalogueQueries';
import type { Book } from '@/entities/book/types';
import { Arriving } from './Arriving';
import { BookRow } from './BookRow';
import { BookSection } from './BookSection';

// Books on the same themes to read after this one, from the catalogue
// (Open Library); more by the same author are with theirs (SameAuthor).
// Opening out softly once found; with none found, or a book the
// catalogue doesn't know, there's no section at all.
export function ReadNext({ book }: { book: Book }) {
  const alike = useSimilarBooks(book.openLibrary?.work).data?.alike ?? [];
  return (
    <Arriving ready={alike.length > 0}>
      <BookSection title='Read next'>
        <BookRow label='On the same themes' books={alike} />
      </BookSection>
    </Arriving>
  );
}
