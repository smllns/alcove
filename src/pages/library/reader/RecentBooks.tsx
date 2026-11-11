import type { Book } from '@/entities/book/types';
import type { ReaderPage } from '@/entities/reader/types';
import { paths } from '@/shared/config/paths';
import { counted } from '@/shared/lib/plural';
import { WorkGrid } from '@/widgets/book-grid';
import { AllLink } from './AllLink';
import { asWork, theirStars } from './readerBooks';
import { PagePart } from './PagePart';

// The books a reader brought to their shelves last, two rows of them,
// with their stars (on another's page, said as theirs, beside the
// reader's own), and the way to all of them
export function RecentBooks({
  page,
  owned,
}: {
  page: ReaderPage;
  owned: Map<string, Book>;
}) {
  if (!page.shows.books || !page.books.length) return null;
  const stars = new Map(page.books.map((book) => [book.workKey, book.rating]));
  // Theirs as theirs, on another's page; the reader's own as the reader's
  const marks = page.you
    ? { stars: (work: { workKey: string }) => stars.get(work.workKey) }
    : { note: theirStars(page) };
  return (
    <PagePart title='Recently added' part='books' page={page}>
      <WorkGrid
        works={page.books.map(asWork)}
        owned={owned}
        ringed={!page.you}
        rows={2}
        rest={
          <AllLink
            to={page.you ? paths.library : paths.readerBooks(page.username)}
          >
            All {counted(page.books.length, 'book')} →
          </AllLink>
        }
        {...marks}
      />
    </PagePart>
  );
}
