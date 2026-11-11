import { useState } from 'react';
import type { Book } from '@/entities/book/types';
import { RemoveBookDialog } from '@/features/remove-book';
import { RemoveAction } from '@/shared/ui/HoverAction';

// A small × that takes a book off the shelves, after asking. Hidden until
// its card is hovered (`group`), except on touch screens, which can't hover.
export function RemoveBook({
  book,
  className,
}: {
  book: Book;
  className?: string;
}) {
  const [asking, setAsking] = useState(false);

  return (
    <>
      <RemoveAction
        label='Remove from library'
        ariaLabel={`Remove “${book.title}”`}
        onClick={() => setAsking(true)}
        className={className}
      />
      <RemoveBookDialog
        book={book}
        open={asking}
        onClose={() => setAsking(false)}
      />
    </>
  );
}
