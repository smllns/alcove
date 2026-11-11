import type { Book } from '@/entities/book/types';
import type { ReaderPage } from '@/entities/reader/types';
import { callName } from '@/entities/user/types';
import { paths } from '@/shared/config/paths';
import { counted } from '@/shared/lib/plural';
import { WorkGrid } from '@/widgets/book-grid';
import { AllLink } from './AllLink';
import { asWork, inCommon, theirStars } from './readerBooks';
import { PagePart } from './PagePart';

// On another reader's page, the books the reader looking has too: a line
// saying how many, and how many both loved, and a row of the books (not
// ringed: they're all the reader's), each with the stars they gave; more
// than fit, the way to all of them as their library shows them, those alone
export function InCommon({
  page,
  owned,
}: {
  page: ReaderPage;
  owned: Map<string, Book>;
}) {
  if (page.you || !page.shows.books || !page.books.length) return null;
  const them = callName(page);
  const common = inCommon(page.books, owned);
  const both = common.books.length;
  return (
    <PagePart title={`You and ${them}`} page={page}>
      <p className='max-w-prose font-serif text-lg leading-relaxed text-ink-soft'>
        {both
          ? `You have ${counted(both, 'book')} in common${common.loved ? `, and both gave five stars to ${counted(common.loved, 'of them', 'of them')}` : ''}.`
          : 'No books in common yet.'}
      </p>
      {both > 0 && (
        <div className='mt-8'>
          <WorkGrid
            works={common.books.map((each) => asWork(each.book))}
            owned={owned}
            ringed={false}
            rows={1}
            rest={
              <AllLink to={paths.readerBooks(page.username, 'yours')}>
                All {counted(both, 'book')} in common →
              </AllLink>
            }
            note={theirStars(page)}
          />
        </div>
      )}
    </PagePart>
  );
}
