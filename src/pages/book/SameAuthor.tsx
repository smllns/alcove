import { useSimilarBooks } from '@/entities/book/catalogueQueries';
import type { Book } from '@/entities/book/types';
import { Arriving } from './Arriving';
import { settled } from '@/shared/lib/settled';
import { BookRow } from './BookRow';
import { BookSection } from './BookSection';
import { asRowBook, useTheirOthers } from './useTheirOthers';

// Where the heading's "more books by them" takes the reader
export const AUTHOR_SECTION = 'by-the-same-author';

// A title compared without case, punctuation or what follows a colon or
// a bracket: "Mules and Men (P.S.)" is "Mules and Men"
const sameTitle = (title: string) =>
  title
    .split(/[:(]/)[0]
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]/gu, '');

// The writer's other books: the reader's own, then those from the
// catalogue (Open Library) the reader hasn't got, opening out softly as
// they're found. (Who the writer is is at the top: AuthorByline.) With
// neither, no section.
export function SameAuthor({ book }: { book: Book }) {
  const { others, known } = useTheirOthers(book);
  const similar = useSimilarBooks(book.openLibrary?.work);
  // Those the reader has are with theirs, even ones added by hand, which
  // the catalogue can't tell are theirs but by the title
  const ownTitles = new Set([book, ...others].map((b) => sameTitle(b.title)));
  const more = (similar.data?.byAuthor ?? []).filter(
    (other) => !other.bookId && !ownTitles.has(sameTitle(other.title)),
  );
  // Opened once both are in, all at once, not one row and then another
  const ready = known && settled(similar) && others.length + more.length > 0;
  const name = book.authors[0] || 'them';

  return (
    <Arriving ready={ready}>
      <BookSection
        id={AUTHOR_SECTION}
        title='By the same author'
        className='scroll-mt-28'
      >
        <div className='flex flex-col gap-8'>
          <BookRow
            label={`More by ${name} on your shelves`}
            books={others.map(asRowBook)}
            ours
          />
          <BookRow label='Not on your shelves yet' books={more} />
        </div>
      </BookSection>
    </Arriving>
  );
}
