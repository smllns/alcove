import { useEffect } from 'react';
import { useLocation, useParams } from 'react-router';
import { catalogueBook } from '@/entities/book/catalogueBook';
import { useWorkSummary } from '@/entities/book/catalogueQueries';
import { useOwnedWork } from '@/entities/book/queries';
import type { AddBookState } from '@/entities/book/types';
import { paths } from '@/shared/config/paths';
import { useTransitionNavigate } from '@/shared/lib/useTransitionNavigate';
import { BookShell } from './BookShell';
import { BookView } from './BookView';

// A book from the catalogue that isn't on the reader's shelves: its page
// laid out as any book's (BookView), with only what the catalogue knows of
// it and a way to add it. One the reader turns out to have opens their own
// copy's page in its place.
export function WorkPage() {
  const { workKey = '' } = useParams();
  const handed = (useLocation().state as AddBookState | null)?.work;
  const summary = useWorkSummary(workKey, handed);
  const owned = useOwnedWork(workKey).data;
  const navigate = useTransitionNavigate();
  useEffect(() => {
    if (owned) void navigate(paths.book(owned), 'none', { replace: true });
  }, [owned, navigate]);

  const work = summary.data;
  const book = work && catalogueBook(work);
  return (
    <BookShell
      book={book}
      error={summary.error}
      gone='Open Library doesn’t know this book.'
    >
      {book && work && <BookView book={book} work={work} />}
    </BookShell>
  );
}
