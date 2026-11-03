import type { CSSProperties, ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';
import { labelClass } from '@/shared/ui/fieldStyles';
import { HoverBooks } from './HoverBooks';
import type { Tally } from './tallies';

// Lines of a ledger (`count` of them) read down columns where there's
// room: two once it's wide enough (`always`, even when it's narrow, for
// short ones), three wider still (unless `two`, for long ones)
export function LedgerColumns({
  count,
  always = false,
  two = false,
  className,
  children,
}: {
  count: number;
  always?: boolean;
  two?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <ul
      className={cn(
        'grid',
        always
          ? 'grid-flow-col grid-cols-2 grid-rows-(--two) gap-x-6'
          : 'gap-x-8 @lg:grid-flow-col @lg:grid-cols-2 @lg:grid-rows-(--two)',
        !two && '@2xl:grid-cols-3 @2xl:grid-rows-(--three)',
        className,
      )}
      style={
        {
          '--two': `repeat(${Math.ceil(count / 2)}, auto)`,
          '--three': `repeat(${Math.ceil(count / 3)}, auto)`,
        } as CSSProperties
      }
    >
      {children}
    </ul>
  );
}

// Those with one book each (authors, languages), under a word saying so:
// only their names (`named`, if not as they're counted), in two columns
// even where the ledger's narrow, each opening its book
export function LedgerNames<T extends Tally>({
  items,
  hover,
  onOpen,
  named = (item) => item.name,
}: {
  items: T[];
  hover: boolean;
  onOpen: (item: T) => void;
  named?: (item: T) => string;
}) {
  return (
    <div className='pt-4'>
      <p className={labelClass}>One book each</p>
      <LedgerColumns count={items.length} always className='mt-1.5'>
        {items.map((item) => (
          <li key={item.name} className='min-w-0'>
            <HoverBooks
              heading={named(item)}
              books={item.books}
              side='start'
              hover={hover}
              onOpen={() => onOpen(item)}
            >
              <span className='block truncate py-[3px] text-left font-serif text-sm text-ink-soft transition-colors duration-500 ease-soft group-hover/books:text-ink'>
                {named(item)}
              </span>
            </HoverBooks>
          </li>
        ))}
      </LedgerColumns>
    </div>
  );
}
