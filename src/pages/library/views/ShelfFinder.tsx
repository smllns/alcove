import { useRef, useState } from 'react';
import { bookMatches } from '@/entities/book/matches';
import type { Book } from '@/entities/book/types';
import { BookLine } from '@/entities/book/ui/BookLine';
import { ownBookLine } from '@/entities/book/ui/ownBookLine';
import { cn } from '@/shared/lib/cn';
import { PHONE, useMediaQuery } from '@/shared/lib/useMediaQuery';
import { BookSearch } from './BookSearch';
import { FoundBy, foundRowClass } from './FoundPanel';

// The most books found shown at once
const SHOWN = 8;

// A book looked for by its title or writer among `books`, each found shown
// by its cover (with `details`, if any), one picked handed to `onPick`:
// in a menu by the field, or on a phone, dropping down under it (FoundBy)
export function ShelfFinder({
  books,
  onPick,
  placeholder,
  details,
  grows,
  className,
}: {
  books: Book[];
  onPick: (book: Book) => void;
  placeholder: string;
  details?: (book: Book) => string;
  // Wider while typed in (BookSearch)
  grows?: boolean;
  className?: string;
}) {
  const field = useRef<HTMLLabelElement>(null);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const phone = useMediaQuery(PHONE);
  const asked = query.trim();
  const found = asked
    ? books.filter((book) => bookMatches(book, asked)).slice(0, SHOWN)
    : [];
  const pick = (book: Book) => {
    setOpen(false);
    setQuery('');
    onPick(book);
  };
  const line = (book: Book) => (
    <BookLine
      {...ownBookLine(book)}
      details={details && [details(book)]}
      size='sm'
    />
  );

  const search = (
    <BookSearch
      ref={field}
      value={query}
      onChange={(next) => {
        setQuery(next);
        setOpen(true);
      }}
      onFocus={() => setOpen(true)}
      onBlur={phone ? () => setOpen(false) : undefined}
      placeholder={placeholder}
      grows={grows}
      className={phone ? 'w-full' : className}
    />
  );

  const row = phone
    ? cn('cursor-pointer', foundRowClass)
    : 'group flex w-full cursor-pointer rounded-lg px-2.5 py-2 text-left transition-colors duration-300 ease-soft hover:bg-ink/6';
  return (
    <FoundBy
      field={search}
      anchor={field}
      open={open && Boolean(asked)}
      onClose={() => setOpen(false)}
      width={340}
      className={className}
    >
      <ul className={cn(!phone && 'pt-1.5')}>
        {found.map((book) => (
          <li key={book.id}>
            <button type='button' onClick={() => pick(book)} className={row}>
              {line(book)}
            </button>
          </li>
        ))}
      </ul>
      {!found.length && (
        <p className='px-3 py-4 text-sm text-muted'>No book by that name.</p>
      )}
    </FoundBy>
  );
}
