import { X } from 'lucide-react';
import { useState } from 'react';
import { useDeleteBook } from '@/entities/book/queries';
import type { Book } from '@/entities/book/types';
import { BookCover } from '@/entities/book/ui/BookCover';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';

// One book in the grid: the cover, then title and author underneath. A
// cross over the cover, shown on hover, takes it off the shelves.
export function BookCard({ book }: { book: Book }) {
  const author = book.authors.join(', ');
  const [asking, setAsking] = useState(false);
  const remove = useDeleteBook();

  const close = () => {
    setAsking(false);
    remove.reset();
  };

  return (
    <article className='group relative'>
      <BookCover
        title={book.title}
        author={author}
        url={book.cover?.url}
        className='shadow-[0_18px_30px_-16px_rgba(40,28,14,0.45),0_2px_5px_rgba(40,28,14,0.12)] transition-transform duration-700 ease-soft group-hover:-translate-y-1.5'
      />
      {/* Rides up with the cover; always there on touch screens, which
          can't hover */}
      <button
        type='button'
        onClick={() => setAsking(true)}
        aria-label={`Remove “${book.title}”`}
        className='absolute right-2 top-2 grid size-8 cursor-pointer place-items-center rounded-full border border-line bg-surface/90 text-ink-soft opacity-0 shadow-sm backdrop-blur-sm transition-all duration-700 ease-soft hover:border-danger hover:text-danger focus-visible:opacity-100 group-hover:-translate-y-1.5 group-hover:opacity-100 [@media(hover:none)]:opacity-100'
      >
        <X size={15} />
      </button>
      <h3 className='mt-3 line-clamp-2 font-serif text-[15px] leading-snug tracking-[-0.01em]'>
        {book.title}
      </h3>
      {author && (
        <p className='mt-0.5 line-clamp-1 text-xs text-muted'>{author}</p>
      )}

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
    </article>
  );
}
