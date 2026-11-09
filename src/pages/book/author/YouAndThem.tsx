import type { ReactNode } from 'react';
import type { Book } from '@/entities/book/types';
import { paths } from '@/shared/config/paths';
import { Rating } from '@/shared/ui/Rating';
import { TransitionLink } from '@/shared/ui/TransitionLink';
import { BookSection } from '../BookSection';
import { readerFigures } from './readerFigures';

// The reader and a writer in a few large numbers, as the stats tell them
// (readerFigures): since when, how many read, how many pages, and their
// favourite, which opens its page. Pages only once some are known.
export function YouAndThem({ theirs }: { theirs: Book[] }) {
  const { since, dated, read, of, pages, favourite } = readerFigures(theirs);
  return (
    <BookSection title='You and them'>
      <dl className='grid grid-cols-2 border-t border-line sm:grid-cols-[repeat(auto-fit,minmax(9rem,1fr))]'>
        <Figure label={dated ? 'Reading them since' : 'With you since'}>
          {since}
        </Figure>
        <Figure label='Read'>
          {read}
          <span className='ml-1.5 text-sm text-muted'>of {of}</span>
        </Figure>
        {pages > 0 && (
          <Figure label='Pages read'>{pages.toLocaleString('en')}</Figure>
        )}
        {favourite && (
          <Figure label='Your favourite'>
            <TransitionLink
              to={paths.book(favourite.id)}
              className='block text-lg leading-snug hover:underline hover:decoration-line hover:underline-offset-4'
            >
              {favourite.title}
            </TransitionLink>
            <Rating
              value={favourite.copy?.rating ?? 0}
              className='mt-1 flex text-xs'
            />
          </Figure>
        )}
      </dl>
    </BookSection>
  );
}

// One of them: its word over it, small, and the figure itself, large
function Figure({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className='flex flex-col gap-1.5 border-b border-line py-4 pr-4'>
      <dt className='text-[11px] uppercase tracking-[0.14em] text-muted'>
        {label}
      </dt>
      <dd className='font-serif text-3xl leading-none text-ink tabular-nums'>
        {children}
      </dd>
    </div>
  );
}
