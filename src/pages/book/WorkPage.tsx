import { useEffect } from 'react';
import { useLocation, useParams } from 'react-router';
import { catalogueBook, inCatalogue } from '@/entities/book/catalogueBook';
import { useWorkSummary } from '@/entities/book/catalogueQueries';
import { useOwnedWork } from '@/entities/book/queries';
import type { AddBookState } from '@/entities/book/types';
import { useLists } from '@/entities/list/queries';
import { ApiError } from '@/shared/api/http';
import { paths } from '@/shared/config/paths';
import { useTransitionNavigate } from '@/shared/lib/useTransitionNavigate';
import { BookShell } from './BookShell';
import { BookView } from './BookView';

// A book from the catalogue that isn't in the reader's library: its page
// laid out as any book's (BookView), with only what the catalogue knows of
// it and a way to add it. One the reader turns out to have opens their own
// copy's page in its place. One the catalogue doesn't know, kept in a list
// as it came from another site (typed-…), shows what the list has of it.
export function WorkPage() {
  const { workKey = '' } = useParams();
  const known = inCatalogue(workKey);
  const handed = (useLocation().state as AddBookState | null)?.work;
  const summary = useWorkSummary(workKey, handed, known);
  const owned = useOwnedWork(workKey, known).data;
  const lists = useLists();
  const navigate = useTransitionNavigate();
  useEffect(() => {
    if (owned) void navigate(paths.book(owned), 'none', { replace: true });
  }, [owned, navigate]);

  const kept = lists.data?.lists
    .flatMap((list) => list.works ?? [])
    .find((work) => work.workKey === workKey);
  const work = known ? summary.data : (handed ?? kept);
  const book = work && catalogueBook(work);
  // Not in any list, once they're all in: as a book that isn't there
  const missing =
    !known && lists.isSuccess && !work
      ? new ApiError(404, 'not_found', 'Not in your lists.')
      : null;
  return (
    <BookShell
      book={book}
      error={known ? summary.error : (lists.error ?? missing)}
      gone={
        known
          ? 'Open Library doesn’t know this book.'
          : 'This book isn’t in your lists any more.'
      }
    >
      {book && work && <BookView book={book} work={work} />}
    </BookShell>
  );
}
