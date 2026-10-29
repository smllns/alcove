import { useState } from 'react';
import type { Book } from '@/entities/book/types';
import { cn } from '@/shared/lib/cn';
import { counted } from '@/shared/lib/plural';
import { Spinner } from '@/shared/ui/Spinner';
import { TransitionLink } from '@/shared/ui/TransitionLink';
import { ListPile } from './ListPile';

// Piles of lists side by side, the floor's width shared evenly among as
// many as fit (four, at the widest), each on its own stretch of floor,
// carrying over onto the next floor down as there are more. Each takes
// three rows of the floor it's on (stackClass): its pile, its name, its
// count, so every pile on a floor stands on the same line, however many
// lines their names take.
export const stacksClass =
  'grid grid-cols-2 gap-x-8 gap-y-14 pt-4 sm:grid-cols-3 lg:grid-cols-4';
export const stackClass = 'row-span-3 grid grid-rows-subgrid gap-y-0';
// A list's name under its floor, as a room's is written on the drawing of
// a home: in spaced capitals
export const stackNameClass =
  'mt-3 w-full text-balance break-words text-center text-[11px] uppercase leading-relaxed tracking-[0.2em]';

// How many of a list's books are the reader's: all, some, or none
function yours(count: number, owned: number) {
  if (!owned) return 'none yours';
  if (owned < count) return `${owned.toLocaleString('en')} yours`;
  return count === 1 ? 'yours' : 'all yours';
}

// One list standing on the floor of the lists, drawn as the house is: its
// pile on a slab over hatched ground, a dimension line beside it giving
// how many books it holds, and under the floor its number and name as a
// room's are written, and how many of its books are the reader's. Leads
// into the list. While its books are still coming, a spinner lies on the
// floor where the pile will be, and the pile and its count fade in as
// they come.
export function ListStack({
  number,
  name,
  to,
  books,
  count,
  owned,
  detail,
  state,
}: {
  // Its place among the lists, from 1
  number: number;
  name: string;
  // Its page
  to: string;
  // The books of it to draw, the top of the pile first; none yet while
  // they're still coming
  books?: Book[];
  // How many there are in all, and how many the reader has; or, said in
  // place of that, something else of it (whose it is)
  count: number;
  owned?: number;
  detail?: string;
  // What its page is opened with
  state?: unknown;
}) {
  // Waited for its books, so they come in softly
  const [waited] = useState(!books);
  const arrive = waited && 'animate-fade-in';
  return (
    <TransitionLink
      to={to}
      state={state}
      className={cn(
        'group w-full max-w-36 justify-self-center justify-items-center',
        stackClass,
      )}
    >
      <div className='flex w-full flex-col items-center justify-end pt-10 transition-transform duration-500 ease-soft group-hover:-translate-y-1'>
        {!books ? (
          <span role='status' aria-label='Loading' className='mb-3 text-faint'>
            <Spinner />
          </span>
        ) : books.length ? (
          <div className={cn('relative', waited && 'animate-arrive')}>
            <ListPile books={books} />
            <span className='list-dim'>{count.toLocaleString('en')}</span>
          </div>
        ) : (
          // Nothing in it yet: the place a book would lie
          <span className='mb-px block h-3 w-24 rounded-[2px] border border-dashed border-line' />
        )}
        <div className='room-floor relative z-1 mx-0! w-full' />
      </div>
      <p className={cn(stackNameClass, 'text-ink')}>
        <span className='mr-[0.6em] tracking-[0.12em] text-muted'>
          {String(number).padStart(2, '0')}
        </span>
        {name}
      </p>
      <p
        // Its room kept while it's still to come
        className={cn(
          'mt-1 text-center text-xs text-muted',
          books ? arrive : 'invisible',
        )}
      >
        {counted(count, 'book')} ·{' '}
        {owned === undefined ? (
          detail
        ) : (
          <>
            <span className={cn(owned ? 'text-gold' : 'text-faint')}>
              {owned ? '●' : '○'}
            </span>{' '}
            {yours(count, owned)}
          </>
        )}
      </p>
    </TransitionLink>
  );
}
