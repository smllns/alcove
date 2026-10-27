import { BookCover } from '@/entities/book/ui/BookCover';
import { cn } from '@/shared/lib/cn';
import { counted } from '@/shared/lib/plural';
import { captionClass } from '@/shared/ui/fieldStyles';
import { sheetClass } from '@/shared/ui/surfaces';
import type { RoomBooks } from '../arrange';

// The most covers a card shows
const SHOWN = 7;

// A room of a home as a plain card, opening into the room: its number and
// name, how many books are in it, a few of their covers, and its bookcases
// with how many each holds; what holds none says so, quietly
export function RoomCard({
  number,
  name,
  units,
  loose,
  count,
  onOpen,
}: Pick<RoomBooks, 'units' | 'loose' | 'count'> & {
  number?: number;
  name: string;
  onOpen: () => void;
}) {
  const books = [
    ...units.flatMap((unit) => [
      ...unit.shelves.flatMap((shelf) => shelf.books),
      ...unit.loose,
    ]),
    ...loose,
  ];
  return (
    <button
      type='button'
      onClick={onOpen}
      className={cn(
        'flex cursor-pointer flex-col gap-5 p-6 text-left transition-colors duration-500 ease-soft hover:bg-surface/70',
        sheetClass,
      )}
    >
      <span className={cn('flex justify-between gap-4', captionClass)}>
        <span>{number !== undefined && String(number).padStart(2, '0')}</span>
        <span
          className={cn('font-normal', count ? 'text-muted' : 'text-faint')}
        >
          {count ? counted(count, 'book') : 'Empty'}
        </span>
      </span>
      <span
        className={cn(
          '-mt-3 font-serif text-2xl tracking-[-0.02em]',
          count ? 'text-ink' : 'text-ink-soft',
        )}
      >
        {name}
      </span>
      {books.length > 0 && (
        <span className='flex gap-1.5'>
          {books.slice(0, SHOWN).map((book) => (
            <BookCover
              key={book.id}
              title={book.title}
              author={book.authors.join(', ')}
              url={book.cover?.url}
              bookId={book.id}
              size='L'
              className='w-9 shadow-[0_6px_10px_-8px_rgb(var(--shade)/calc(0.5*var(--shade-k)))]'
            />
          ))}
        </span>
      )}
      {units.length > 0 && (
        <span className='flex flex-col gap-1.5 text-sm text-ink-soft'>
          {units.map(({ unit, count: held }) => (
            <span key={unit.id} className='flex justify-between gap-4'>
              {unit.name}
              <span
                className={cn(
                  'tabular-nums',
                  held ? 'text-muted' : 'text-faint',
                )}
              >
                {held || 'empty'}
              </span>
            </span>
          ))}
        </span>
      )}
    </button>
  );
}
