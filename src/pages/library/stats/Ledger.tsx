import { useState, type ReactNode } from 'react';
import type { Book } from '@/entities/book/types';
import { cn } from '@/shared/lib/cn';
import { counted } from '@/shared/lib/plural';
import { Collapse } from '@/shared/ui/Collapse';
import { MoreToggle } from '@/shared/ui/MoreToggle';
import { HoverBooks } from '@/widgets/book-cards';
import { LedgerColumns, LedgerNames } from './LedgerNames';
import type { GroupPage } from '@/widgets/book-cards';
import { FEW, type Tally } from '@/entities/book/tallies';

// Names and their numbers, one under another, dotted across from one to
// the other as in a book's contents
export function Ledger({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <ul className={cn('flex flex-col', className)}>{children}</ul>;
}

// How far apart its lines stand: words close, lines with a drawing in
// them (`drawn`) further, the finer ones under them in two columns at most
const spacing = {
  words: { lines: '', fine: 'pt-1', toggle: 'mt-3' },
  drawn: { lines: 'gap-4', fine: 'gap-y-1.5 pt-3', toggle: 'mt-4' },
};

// A ledger of things counted, the most first. Only a few, all of them
// alike. More, the first few (`shown`) written large; the rest opening out
// under them, as the genres do: those with more than one book finer and
// closer, in columns where there's room (LedgerColumns), then those with
// one book each only named (LedgerNames). Each line drawn by `row`, told
// whether it's one of the finer ones and its place; each named one called
// `named` and opening its books by `onOpen`, with its own page (`pageOf`),
// if it has one.
export function LedgerWithMore<T extends Tally>({
  items,
  shown = 5,
  noun,
  row,
  hover,
  onOpen,
  named,
  pageOf,
  drawn = false,
}: {
  items: T[];
  shown?: number;
  noun: string;
  row: (item: T, fine: boolean, place: number) => ReactNode;
  hover: boolean;
  onOpen: (item: T) => void;
  named?: (item: T) => string;
  pageOf?: (item: T) => GroupPage;
  drawn?: boolean;
}) {
  const [all, setAll] = useState(false);
  const space = spacing[drawn ? 'drawn' : 'words'];
  // From its place on (those after the first few with more than one book
  // come straight after them, the commonest first)
  const lines = (list: T[], from: number, fine = false) =>
    list.map((item, i) => row(item, fine, from + i));
  if (items.length <= FEW)
    return <Ledger className={space.lines}>{lines(items, 1)}</Ledger>;
  const after = items.slice(shown);
  const rest = after.filter((item) => item.books.length > 1);
  const once = after.filter((item) => item.books.length === 1);
  return (
    <div className='@container'>
      <Ledger className={space.lines}>{lines(items.slice(0, shown), 1)}</Ledger>
      <Collapse open={all}>
        {rest.length > 0 && (
          <LedgerColumns count={rest.length} two={drawn} className={space.fine}>
            {lines(rest, shown + 1, true)}
          </LedgerColumns>
        )}
        {once.length > 0 && (
          <LedgerNames
            items={once}
            hover={hover}
            onOpen={onOpen}
            named={named}
            pageOf={pageOf}
          />
        )}
      </Collapse>
      <MoreToggle
        open={all}
        onClick={() => setAll(!all)}
        className={space.toggle}
      >
        {all ? `Show top ${shown}` : `Show all ${counted(items.length, noun)}`}
      </MoreToggle>
    </div>
  );
}

// One line of it: `after` the number, a small drawing of what's counted;
// `fine`, smaller and closer, for the lines opened out. Given its
// `books`, they open as a month's do (HoverBooks): pointed at, in a card
// over the line; tapped, in a drawer (`onOpen`); its own `page`, if it
// has one, a click away.
export function LedgerRow({
  name,
  value,
  after,
  fine = false,
  books,
  hover = false,
  onOpen,
  page,
}: {
  name: string;
  value: ReactNode;
  after?: ReactNode;
  fine?: boolean;
  books?: Book[];
  hover?: boolean;
  onOpen?: () => void;
  page?: GroupPage;
}) {
  const text = fine ? 'text-sm text-ink-soft' : 'text-lg';
  const line = (
    <span
      className={cn(
        'flex items-baseline gap-2 text-left',
        fine ? 'py-[3px]' : 'py-2',
      )}
    >
      <span className={cn('min-w-0 truncate font-serif', text)}>{name}</span>
      <span aria-hidden className='stats-dots' />
      <span className={cn('shrink-0 font-serif', text)}>{value}</span>
      {after}
    </span>
  );
  if (!books) return <li>{line}</li>;
  return (
    <li>
      <HoverBooks
        heading={name}
        books={books}
        hover={hover}
        onOpen={() => onOpen?.()}
        page={page}
      >
        {line}
      </HoverBooks>
    </li>
  );
}
