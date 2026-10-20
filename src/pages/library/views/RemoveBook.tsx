import { X } from 'lucide-react';
import { useState } from 'react';
import { useDeleteBook } from '@/entities/book/queries';
import type { Book } from '@/entities/book/types';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { Tooltip } from '@/shared/ui/Tooltip';

// A small × that takes a book off the shelves, after asking. Hidden until
// its card is hovered (`group`), except on touch screens, which can't hover.
export function RemoveBook({
  book,
  className,
}: {
  book: Book;
  className?: string;
}) {
  const author = book.authors.join(', ');
  const [asking, setAsking] = useState(false);
  const remove = useDeleteBook();

  const close = () => {
    setAsking(false);
    remove.reset();
  };

  return (
    <>
      <Tooltip label='Remove from library' className={className}>
        <button
          type='button'
          onClick={() => setAsking(true)}
          aria-label={`Remove “${book.title}”`}
          className='grid size-8 cursor-pointer place-items-center rounded-full border border-line bg-surface/90 text-ink-soft opacity-0 shadow-sm backdrop-blur-sm transition-all duration-700 ease-soft hover:border-danger hover:text-danger focus-visible:opacity-100 group-hover:opacity-100 [@media(hover:none)]:opacity-100'
        >
          <X size={15} />
        </button>
      </Tooltip>
      <ConfirmDialog
        open={asking}
        title='Remove this book?'
        confirmLabel='Remove for good'
        onConfirm={() => remove.mutate(book.id, { onSuccess: close })}
        onCancel={close}
        busy={remove.isPending}
        error={remove.error?.message}
      >
        “{book.title}”{author && ` by ${author}`} will be gone from your
        library, along with your review, notes and quotes. This can’t be undone.
      </ConfirmDialog>
    </>
  );
}
