import { useEffect, useMemo } from 'react';
import { useLocation, useParams } from 'react-router';
import {
  catalogueBook,
  inCatalogue,
  isReadersOwn,
} from '@/entities/book/catalogueBook';
import { useWorkSummary } from '@/entities/book/catalogueQueries';
import { ownCopies } from '@/entities/book/ownCopies';
import { useBooks, useOwnedWork } from '@/entities/book/queries';
import { useShelf } from '@/entities/book/useShelf';
import type { AddBookState } from '@/entities/book/types';
import { useLists } from '@/entities/list/queries';
import { useReaderBook } from '@/entities/reader/queries';
import { ApiError } from '@/shared/api/http';
import { paths } from '@/shared/config/paths';
import { useTransitionNavigate } from '@/shared/lib/useTransitionNavigate';
import { BookFrame } from './BookFrame';
import { BookShell } from './BookShell';
import { BookView } from './BookView';

// A book from the catalogue that isn't in the reader's library: its page
// laid out as any book's (BookView), with only what the catalogue knows of
// it and a way to add it. One the reader turns out to have opens their own
// copy's page in its place. One the catalogue doesn't know, kept in a list
// as it came from another site (typed-…), shows what the list has of it;
// another reader's own (book-…), what was handed over from their page.
export function WorkPage() {
  const { workKey = '' } = useParams();
  const known = inCatalogue(workKey);
  const handed = (useLocation().state as AddBookState | null)?.work;
  const summary = useWorkSummary(workKey, handed, known);
  // The reader's own copy: of the catalogue's work, or of another
  // reader's own book, the same title by the same writer
  const shelf = useShelf(useBooks(), '', true).all;
  const ownedWork = useOwnedWork(workKey, known).data;
  const lists = useLists();
  // Another reader's own, as alcove has it from their shelves
  const theirs = useReaderBook(workKey);
  const shelved = isReadersOwn(workKey);
  const navigate = useTransitionNavigate();
  const told = theirs.data ?? handed;
  const copy = useMemo(
    () => shelved && told && ownCopies([told], shelf).get(told.workKey),
    [shelved, told, shelf],
  );
  const owned = ownedWork ?? (copy ? copy.id : undefined);
  useEffect(() => {
    if (owned) void navigate(paths.book(owned), 'none', { replace: true });
  }, [owned, navigate]);
  // On its way to the reader's own copy: nothing of it drawn as not theirs
  // meanwhile
  if (owned)
    return (
      <BookFrame back={paths.library} wide>
        {null}
      </BookFrame>
    );

  const kept = lists.data?.lists
    .flatMap((list) => list.works ?? [])
    .find((work) => work.workKey === workKey);
  // Where it's told from, by what kind of book it is: the catalogue, the
  // reader whose own it is, or the reader's own lists
  const inLists = kept ?? handed;
  const from = known
    ? {
        work: summary.data,
        error: summary.error,
        gone: 'Open Library doesn’t know this book.',
      }
    : shelved
      ? {
          work: told,
          error: told ? null : theirs.error,
          gone: 'Its reader doesn’t show it.',
        }
      : {
          work: inLists,
          // Not in any list, once they're all in: as a book that isn't there
          error:
            lists.error ??
            (lists.isSuccess && !inLists
              ? new ApiError(404, 'not_found', 'Not in your lists.')
              : null),
          gone: 'This book isn’t in your lists any more.',
        };
  const { work } = from;
  const book = work && catalogueBook(work);
  return (
    <BookShell book={book} error={from.error} gone={from.gone}>
      {book && work && <BookView book={book} work={work} />}
    </BookShell>
  );
}
