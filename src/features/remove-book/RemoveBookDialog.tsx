import { useDeleteBook } from '@/entities/book/queries';
import type { Book } from '@/entities/book/types';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';

// Asks before taking a book off the shelves for good
export function RemoveBookDialog({
  book,
  open,
  onClose,
  onRemoved = onClose,
}: {
  book: Book;
  open: boolean;
  onClose: () => void;
  onRemoved?: () => void;
}) {
  const author = book.authors.join(', ');
  const remove = useDeleteBook();

  const close = () => {
    onClose();
    remove.reset();
  };

  return (
    <ConfirmDialog
      open={open}
      title='Remove this book?'
      confirmLabel='Remove for good'
      onConfirm={() =>
        remove.mutate(book.id, {
          onSuccess: () => {
            remove.reset();
            onRemoved();
          },
        })
      }
      onCancel={close}
      busy={remove.isPending}
      error={remove.error?.message}
    >
      “{book.title}”{author && ` by ${author}`} will be gone from your library,
      along with your review, notes and quotes. This can’t be undone.
    </ConfirmDialog>
  );
}
