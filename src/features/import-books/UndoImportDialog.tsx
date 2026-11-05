import { useUndoImport } from '@/entities/book/importQueries';
import { counted, plural } from '@/shared/lib/plural';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';

// Asked before an import is undone: every book it brought over comes off
// the shelves (`books` of them, said where it's the reader's last), and
// what it put in Want to read comes out. Closed (`onClose`) once it's done,
// and told so (`onUndone`).
export function UndoImportDialog({
  importId,
  books,
  open,
  onClose,
  onUndone,
}: {
  importId: string | undefined;
  books?: number;
  open: boolean;
  onClose: () => void;
  onUndone?: () => void;
}) {
  const undo = useUndoImport();
  return (
    <ConfirmDialog
      open={open}
      title={
        books === undefined ? 'Undo this import?' : 'Undo your last import?'
      }
      confirmLabel='Undo import'
      busy={undo.isPending}
      error={undo.error?.message ?? null}
      onCancel={onClose}
      onConfirm={() =>
        importId &&
        undo.mutate(importId, {
          onSuccess: () => {
            onClose();
            onUndone?.();
          },
        })
      }
    >
      {books === undefined
        ? 'Every book it brought over comes'
        : `The ${counted(books, 'book')} it brought over ${plural(books, 'comes', 'come')}`}{' '}
      off your shelves, and what it put in Want to read comes out, even if
      you’ve changed them since.
    </ConfirmDialog>
  );
}
