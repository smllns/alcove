import { Bookmark } from 'lucide-react';
import type { Book } from '@/entities/book/types';
import { WANT_LIST } from '@/entities/list/names';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/Button';
import { useBookLists } from './useBookLists';

// Beside a book not read yet, the reader's own or one from the catalogue:
// put it in Want to read, or take it out again, in one tap, its mark
// filling in gold while it's there. Nothing for a book being read or read.
export function WantToRead({ book }: { book: Book }) {
  const { value, change } = useBookLists(book);
  const reading = book.copy?.reading;
  if (reading === 'read' || reading === 'reading') return null;
  const wanted = value.includes(WANT_LIST);
  return (
    <Button
      variant='pill'
      aria-pressed={wanted}
      onClick={() =>
        change(
          wanted
            ? value.filter((id) => id !== WANT_LIST)
            : [...value, WANT_LIST],
        )
      }
      className={cn(wanted && 'border-gold')}
    >
      <Bookmark
        size={14}
        className={cn(
          'transition-colors duration-300 ease-soft',
          wanted && 'fill-gold text-gold',
        )}
      />
      Want to read
    </Button>
  );
}
