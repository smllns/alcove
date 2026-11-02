import type { Book } from '@/entities/book/types';
import { cn } from '@/shared/lib/cn';
import { ListPile } from '../lists/ListPile';
import { figures, stampOf } from './libraryStats';
import { tallness } from './sayings';

// On a phone, where a drawing of a building is too small to read: the
// books as a pile, as the lists draw theirs (ListPile), on a slab over
// hatched ground, a dimension line beside it giving how high they'd stand;
// and on its left, level with the pile's middle, the figures a drawing's
// title block would give, one under another
export function PhoneStack({ books }: { books: Book[] }) {
  const found = figures(books);
  return (
    <div className='flex items-center gap-6'>
      <dl className='flex w-28 shrink-0 flex-col border border-(--fine)'>
        {stampOf(found).map(([name, value], i) => (
          <div
            key={name}
            className={cn('px-2.5 py-1', i > 0 && 'border-t border-(--fine)')}
          >
            <dt className='text-[9px] uppercase tracking-[0.18em] text-muted'>
              {name}
            </dt>
            <dd className='font-serif text-[17px] leading-snug'>
              {value.toLocaleString('en')}
            </dd>
          </div>
        ))}
      </dl>
      <div className='flex min-w-0 flex-1 flex-col items-center pt-6'>
        <div className='relative -translate-x-4'>
          <ListPile books={books} />
          <span className='list-dim'>{tallness(found.height)}</span>
        </div>
        <div className='room-floor relative z-1 mx-0! w-full' />
      </div>
    </div>
  );
}
