import { Undo2 } from 'lucide-react';
import { useState } from 'react';
import type { ImportCounts } from '@/entities/book/importApi';
import type { WantedCounts } from '@/entities/list/api';
import { WANT_LIST } from '@/entities/list/names';
import { paths } from '@/shared/config/paths';
import { counted, plural } from '@/shared/lib/plural';
import { UndoImportDialog } from '@/features/import-books';
import { Button } from '@/shared/ui/Button';
import { ButtonLink } from '@/shared/ui/ButtonLink';
import { dangerPillClass } from '@/shared/ui/buttonStyles';

export type Brought = { books?: ImportCounts; wanted?: WantedCounts };

// "1 book was", "3 books were"
const were = (n: number) => `${counted(n, 'book')} ${plural(n, 'was', 'were')}`;

// What came of bringing the books over: how many came into the library
// and into Want to read; those already there, those that couldn't be
// read, and those Open Library didn't know (come as the file had them,
// the reader's to change); the ways on to them, and, after asking, a way
// to undo it all (`onUndone`, once it is)
export function ImportDone({
  brought,
  importId,
  onUndone,
}: {
  brought: Brought;
  importId: string;
  onUndone: () => void;
}) {
  const [asking, setAsking] = useState(false);
  const { books, wanted } = brought;
  const unfound = (books?.unfound ?? 0) + (wanted?.unfound ?? 0);
  const them = plural(unfound, 'it', 'them');
  return (
    <div className='flex flex-col gap-6'>
      <div className='flex flex-col gap-1 font-serif text-2xl text-ink'>
        {books && <p>{counted(books.added, 'book')} brought over.</p>}
        {wanted && <p>{counted(wanted.added, 'book')} put in Want to read.</p>}
      </div>
      {(books?.skipped || books?.failed || unfound > 0) && (
        <p className='max-w-xl font-serif text-lg leading-relaxed text-ink-soft'>
          {books?.skipped
            ? `${were(books.skipped)} already in your library. `
            : ''}
          {books?.failed
            ? `${were(books.failed)} couldn’t be read and left out. `
            : ''}
          {unfound > 0 &&
            `Open Library didn’t know ${counted(unfound, 'book')}, so ${plural(unfound, 'it', 'they')} came as the file had ${them}, without a cover. You can change ${them} any time.`}
        </p>
      )}
      <div className='flex flex-wrap gap-3'>
        <ButtonLink to={paths.library} arrow>
          See your library
        </ButtonLink>
        {wanted && (
          <ButtonLink to={paths.list(WANT_LIST)} variant='pill'>
            See Want to read
          </ButtonLink>
        )}
        <ButtonLink to={paths.stats} variant='pill'>
          See your stats
        </ButtonLink>
        <Button
          variant='pill'
          onClick={() => setAsking(true)}
          className={dangerPillClass}
        >
          <Undo2 size={14} />
          Undo this import
        </Button>
      </div>
      <UndoImportDialog
        importId={importId}
        open={asking}
        onClose={() => setAsking(false)}
        onUndone={onUndone}
      />
    </div>
  );
}
