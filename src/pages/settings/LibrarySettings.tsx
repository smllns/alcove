import { useState } from 'react';
import {
  useDeleteAllBooks,
  useLastImport,
} from '@/entities/book/importQueries';
import { useBooks } from '@/entities/book/queries';
import { UndoImportDialog } from '@/features/import-books';
import { paths } from '@/shared/config/paths';
import { longDate } from '@/shared/lib/dates';
import { counted } from '@/shared/lib/plural';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { TransitionLink } from '@/shared/ui/TransitionLink';
import { rowLinkClass } from './rowLink';
import { SettingRow } from './SettingRow';

// The library as a whole: books brought over from another site, the latest
// import undone, and every book taken off at once, each after asking
export function LibrarySettings() {
  const total = useBooks().data?.pages[0]?.total ?? 0;
  const last = useLastImport().data;
  const wipe = useDeleteAllBooks();
  const [asking, setAsking] = useState<'undo' | 'wipe' | null>(null);
  const done = { onSuccess: () => setAsking(null) };
  return (
    <>
      <SettingRow
        label='Bring books over'
        value='From Goodreads or StoryGraph'
        action={
          <TransitionLink to={paths.importBooks} className={rowLinkClass}>
            Import →
          </TransitionLink>
        }
      />
      {last && last.books > 0 && (
        <SettingRow
          label='Last import'
          value={`${counted(last.books, 'book')} · ${longDate(new Date(last.at))}`}
          action={
            <button
              type='button'
              onClick={() => setAsking('undo')}
              className={rowLinkClass}
            >
              Undo
            </button>
          }
        />
      )}
      <SettingRow
        label='Your books'
        value={counted(total, 'book')}
        action={
          total > 0 && (
            <button
              type='button'
              onClick={() => setAsking('wipe')}
              className={`${rowLinkClass} hover:text-danger`}
            >
              Delete all
            </button>
          )
        }
      />
      <UndoImportDialog
        importId={last?.id}
        books={last?.books ?? 0}
        open={asking === 'undo'}
        onClose={() => setAsking(null)}
      />
      <ConfirmDialog
        open={asking === 'wipe'}
        title='Delete all your books?'
        confirmLabel='Delete all books'
        busy={wipe.isPending}
        error={wipe.error?.message ?? null}
        onCancel={() => setAsking(null)}
        onConfirm={() => wipe.mutate(undefined, done)}
      >
        {total === 1
          ? 'Your one book comes'
          : `All ${counted(total, 'book')} come`}{' '}
        off your shelves, with your notes, quotes and reviews. Your lists and
        places stay, only without them. This can’t be undone.
      </ConfirmDialog>
    </>
  );
}
