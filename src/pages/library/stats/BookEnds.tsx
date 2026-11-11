import type { ReactNode } from 'react';
import type { Book } from '@/entities/book/types';
import { BookCover } from '@/entities/book/ui/BookCover';
import { paths } from '@/shared/config/paths';
import { labelClass } from '@/shared/ui/fieldStyles';
import { TransitionLink } from '@/shared/ui/TransitionLink';

type End = { kind: string; book: Book };

// One end of the span: what it is, its measure large (`value`), and the
// book, its cover beside its title and who wrote it; leading to it, and
// pointed at, its cover rising slowly a touch and brightening, as the
// spines do
function EndCard({ kind, book, value }: End & { value: ReactNode }) {
  const author = book.authors.join(', ');
  return (
    <TransitionLink
      to={paths.book(book.id)}
      className='group flex min-w-0 flex-1 flex-col gap-3 p-4 sm:p-5'
    >
      <span className='flex items-baseline justify-between gap-3'>
        <span className={labelClass}>{kind}</span>
        <span className='font-serif text-2xl leading-none whitespace-nowrap text-ink'>
          {value}
        </span>
      </span>
      <span className='flex items-center gap-3'>
        <span className='w-9 shrink-0 transition-[translate,filter] duration-700 ease-soft group-hover:-translate-y-1 group-hover:brightness-110'>
          <BookCover
            title={book.title}
            author={author}
            url={book.cover?.url}
            size='S'
          />
        </span>
        <span className='min-w-0'>
          <span className='line-clamp-2 font-serif text-[0.9375rem] leading-snug italic transition-colors duration-300 group-hover:text-ink-soft'>
            {book.title}
          </span>
          {author && (
            <span className='mt-0.5 block truncate text-xs text-muted'>
              {author}
            </span>
          )}
        </span>
      </span>
    </TransitionLink>
  );
}

// The two books at the ends of a chapter's span (the oldest and the
// newest, the slimmest and the thickest), ruled off under its drawing as
// the title block is under a drawing: one at each end, each with its
// measure (`value`), and between them, measured as an architect measures,
// how far one is from the other (on a phone, one over the other, the
// measure left to the sentence above). The same book at both ends shown
// once, as the `only` one (or as the first).
export function BookEnds({
  first,
  last,
  only,
  value,
  measure,
}: {
  first: End;
  last: End;
  only?: string;
  value: (book: Book) => ReactNode;
  measure: string;
}) {
  if (first.book === last.book)
    return (
      <div className='max-w-sm border border-(--fine)'>
        <EndCard
          kind={only ?? first.kind}
          book={first.book}
          value={value(first.book)}
        />
      </div>
    );
  return (
    <div className='flex border border-(--fine) max-sm:flex-col'>
      <EndCard {...first} value={value(first.book)} />
      <span
        aria-hidden
        className='relative w-28 shrink-0 self-stretch border-x border-(--fine) max-sm:hidden'
      >
        {/* The dimension line, ticked at its ends */}
        <span className='absolute inset-x-3 top-1/2 h-px bg-(--fine)' />
        <span className='absolute top-1/2 left-3 h-2 w-px -translate-y-1/2 bg-(--fine)' />
        <span className='absolute top-1/2 right-3 h-2 w-px -translate-y-1/2 bg-(--fine)' />
        <span className='absolute inset-x-0 top-1/2 -translate-y-[calc(100%+4px)] text-center font-serif text-[0.8125rem] text-ink-soft'>
          {measure}
        </span>
      </span>
      <span className='h-px bg-(--fine) sm:hidden' />
      <EndCard {...last} value={value(last.book)} />
    </div>
  );
}
