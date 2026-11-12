import type { ReactNode } from 'react';
import type { AddBookState, Book } from '@/entities/book/types';
import type { ReaderBook } from '@/entities/reader/types';
import { paths } from '@/shared/config/paths';
import { TransitionLink } from '@/shared/ui/TransitionLink';
import { asWork } from '@/entities/book/catalogueBook';

// A book on a reader's page, opening the reader's own copy of it (by its
// work, `owned`: on their own page, the book itself), or else its page as
// a book from the catalogue (one the catalogue doesn't know, with all its
// reader's page says of it)
export function ReaderBookLink({
  book,
  owned,
  className,
  children,
}: {
  book: ReaderBook;
  owned: Map<string, Book>;
  className?: string;
  children: ReactNode;
}) {
  const mine = owned.get(book.workKey)?.id;
  return (
    <TransitionLink
      to={mine ? paths.book(mine) : paths.work(book.workKey)}
      state={mine ? undefined : ({ work: asWork(book) } satisfies AddBookState)}
      className={className}
    >
      {children}
    </TransitionLink>
  );
}
