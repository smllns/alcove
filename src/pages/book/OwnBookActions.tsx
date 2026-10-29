import { NotebookPen, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { ButtonLink } from '@/shared/ui/ButtonLink';
import type { Book } from '@/entities/book/types';
import { AddToList } from './AddToList';

// What the reader can do with a book of theirs: change it, write a first
// review (until there is one), put it in a list, take it off the shelves
export function OwnBookActions({
  book,
  editPath,
  reviewed,
  onReview,
  onRemove,
}: {
  book: Book;
  editPath: string;
  reviewed: boolean;
  onReview: () => void;
  onRemove: () => void;
}) {
  return (
    <>
      <ButtonLink to={editPath} variant='pill'>
        <Pencil size={14} />
        Edit
      </ButtonLink>
      {!reviewed && (
        <Button variant='pill' onClick={onReview}>
          <NotebookPen size={14} />
          Write a review
        </Button>
      )}
      <AddToList book={book} />
      <Button
        variant='pill'
        onClick={onRemove}
        className='hover:border-danger hover:text-danger'
      >
        <Trash2 size={14} />
        Remove
      </Button>
    </>
  );
}
