import type { Ref } from 'react';
import type { Book } from '@/entities/book/types';
import { textLinkClass } from '@/shared/ui/buttonStyles';
import { TransitionLink } from '@/shared/ui/TransitionLink';
import { BookRows } from './BookRows';
import type { GroupPage } from './useBooksDrawer';

// What's in the card over a group of books (a month, a decade): its name
// in serif, a word on it (the year, how many) under a fine rule, then its
// books one under another, each its cover with its title and author
// beside it; past a few, scrolled through (`scroller`, the box they
// scroll in, `room`, how tall it may be; `detail`, a word on each book).
// Under its name, the way to its own `page`, if it has one.
export function BooksCard({
  heading,
  meta,
  books,
  scroller,
  room,
  detail,
  page,
}: {
  heading: string;
  meta: string;
  books: Book[];
  scroller?: Ref<HTMLDivElement>;
  room: number;
  detail?: (book: Book) => string;
  page?: GroupPage;
}) {
  return (
    <>
      <div className='mb-2 flex items-baseline justify-between gap-6 border-b border-line pb-2.5'>
        <p className='font-serif text-xl leading-none tracking-[-0.01em] text-ink'>
          {heading}
        </p>
        <p className='whitespace-nowrap text-xs uppercase tracking-[0.2em] text-muted'>
          {meta}
        </p>
      </div>
      {page && (
        <TransitionLink
          to={page.to}
          className={`mb-1 inline-block text-xs text-muted ${textLinkClass}`}
        >
          {page.label} →
        </TransitionLink>
      )}
      <div
        ref={scroller}
        className='-mr-3 overflow-y-auto pr-3'
        style={{ maxHeight: room }}
      >
        <BookRows books={books} detail={detail} />
      </div>
    </>
  );
}
