import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import { catalogueBook } from '@/entities/book/catalogueBook';
import type { ReaderPage } from '@/entities/reader/types';
import { callName } from '@/entities/user/types';
import { counted } from '@/shared/lib/plural';
import { Avatar } from '@/shared/ui/Avatar';
import { ChoiceCapsule } from '@/shared/ui/ChoiceCapsule';
import { Eyebrow, PageTitle } from '@/shared/ui/PageHeading';
import { useListSearch } from '@/widgets/book-search';
import { useWorkOrder } from '@/widgets/book-order';
import { WorkGrid } from '@/widgets/book-grid';
import { BookSearch } from '@/widgets/book-search';
import { ShelfOrderMenu } from '@/widgets/book-order';
import { asWork } from '@/entities/book/catalogueBook';
import { theirStars } from './readerBooks';
import { useOwned } from './useOwned';

// Which of their books are shown: all, those the reader looking has too,
// or those they haven't yet
type Show = 'all' | 'yours' | 'new';
const shows: { value: Show; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'yours', label: 'Also yours' },
  { value: 'new', label: 'Not yours' },
];

// Another reader's books, as the reader's own are on their shelves: found
// by title or writer, narrowed to those the reader has too or hasn't yet,
// ordered (by the reader's own stars, among the rest), and drawn as
// covers, the reader's own ringed in gold, with the stars the other gave
export function ReaderLibrary({ page }: { page: ReaderPage }) {
  const owned = useOwned(page);
  // Come to for the books in common alone (?show=yours), those first
  const [params] = useSearchParams();
  const [show, setShow] = useState<Show>(
    params.get('show') === 'yours' ? 'yours' : 'all',
  );
  const them = callName(page);
  const works = useMemo(() => page.books.map(asWork), [page.books]);
  const order = useWorkOrder(works, owned, 'reader');
  const kept = works.filter(
    (work) => show === 'all' || (show === 'yours') === owned.has(work.workKey),
  );
  const search = useListSearch(kept, catalogueBook);
  const shown = order.sort(search.found);

  return (
    <div className='flex flex-col gap-8'>
      <div className='flex items-center gap-4'>
        <Avatar name={them} url={page.avatarUrl} size='lg' />
        <div>
          <Eyebrow rise={0}>{them}’s library</Eyebrow>
          <PageTitle rise={60} size='sm' className='mt-2'>
            {page.shows.books ? counted(page.books.length, 'book') : 'Books'}
          </PageTitle>
        </div>
      </div>
      {!page.shows.books ? (
        <p className='animate-rise font-serif text-lg text-muted'>
          {them} keeps their books to themselves.
        </p>
      ) : (
        <>
          <div className='flex animate-rise flex-wrap items-center gap-3'>
            <BookSearch
              grows={false}
              value={search.query}
              onChange={search.setQuery}
              found={search.asked ? search.found.length : undefined}
              placeholder={`Find in ${them}’s books`}
              className='w-full sm:w-80'
            />
            <ChoiceCapsule
              label='Which books'
              words
              options={shows}
              current={show}
              onChange={setShow}
            />
            <ShelfOrderMenu {...order.menu} className='ml-auto' />
          </div>
          {shown.length ? (
            <WorkGrid works={shown} owned={owned} note={theirStars(page)} />
          ) : search.asked ? (
            <p className='animate-arrive text-[0.9375rem] text-muted'>
              None of {them}’s books by that name.
            </p>
          ) : (
            <p className='text-[0.9375rem] text-muted'>
              {show === 'new'
                ? 'You have every one of them.'
                : 'None of them on your shelves yet.'}
            </p>
          )}
        </>
      )}
    </div>
  );
}
