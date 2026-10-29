import type { ReactNode } from 'react';
import type { Book } from '@/entities/book/types';
import { paths } from '@/shared/config/paths';
import { Loading } from '@/shared/ui/Loading';
import { BookFrame } from './BookFrame';
import { BookMissing } from './BookMissing';
import { CoverAmbience } from './CoverAmbience';

// Around any book's page, the reader's own or one from the catalogue: the
// cover's light behind it, and the book itself (`children`) once it's
// there; till then, a spinner, or what went wrong
export function BookShell({
  book,
  error,
  gone,
  children,
}: {
  book: Book | undefined;
  error: Error | null;
  // What's said of a book that isn't there (BookMissing)
  gone?: string;
  children: ReactNode;
}) {
  return (
    <BookFrame
      back={paths.library}
      wide
      // Beside the book, once there's a book to set it beside
      backBeside={Boolean(book)}
      backdrop={book && <CoverAmbience key={book.id} book={book} />}
    >
      {book ? (
        children
      ) : error ? (
        <BookMissing error={error} gone={gone} />
      ) : (
        <Loading />
      )}
    </BookFrame>
  );
}
