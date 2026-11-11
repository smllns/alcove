import { authorAskOf } from '@/entities/book/authorAsk';
import {
  useBookAuthor,
  useSimilarBooks,
} from '@/entities/book/catalogueQueries';
import type { Book } from '@/entities/book/types';
import { Arriving } from './Arriving';
import { settled } from '@/shared/lib/settled';
import { BookRow } from './BookRow';
import { cn } from '@/shared/lib/cn';
import { Collapse } from '@/shared/ui/Collapse';
import { TitledSection } from '@/shared/ui/TitledSection';
import { asRowBook, useTheirOthers } from './useTheirOthers';
import { useMatchedWorks } from '@/entities/book/useMatchedWorks';

// Where the heading's "more books by them" takes the reader
export const AUTHOR_SECTION = 'by-the-same-author';

// The writer's other books: the reader's own, shown as soon as they're
// known (they're on hand), then those from the catalogue (Open Library)
// the reader hasn't got, opening out softly under them when they come.
// (Who the writer is is at the top: AuthorByline.) With neither, no
// section.
export function SameAuthor({ book }: { book: Book }) {
  const { others, known } = useTheirOthers(book);
  const similar = useSimilarBooks(book.openLibrary?.work);
  // Only theirs by when they came out; and not the reader's, nor any of
  // theirs under another title (added by hand, or translated: the
  // catalogue keeps a translation apart, useMatchedWorks)
  const writer = useBookAuthor(authorAskOf(book)).data;
  const { unread: more } = useMatchedWorks(
    [book, ...others],
    similar.data?.byAuthor ?? [],
    known && settled(similar),
    writer?.born,
    writer?.died,
  );
  const own = known && others.length > 0;
  // Not the reader's ones, once they're known: only then are there any
  const found = more.length > 0;
  const name = book.authors[0] || 'them';

  return (
    <Arriving ready={own || found}>
      <TitledSection
        id={AUTHOR_SECTION}
        title='By the same author'
        className='scroll-mt-28'
      >
        <BookRow
          label={`More by ${name} on your shelves`}
          books={others.map(asRowBook)}
          ours
        />
        <Collapse open={found} arriving>
          <div className={cn(own && 'pt-8')}>
            <BookRow label='Not on your shelves yet' books={more} />
          </div>
        </Collapse>
      </TitledSection>
    </Arriving>
  );
}
