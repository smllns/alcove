import type { Book } from '@/entities/book/types';
import { counted } from '@/shared/lib/plural';
import { Drawer } from '@/shared/ui/Drawer';
import { labelClass } from '@/shared/ui/fieldStyles';
import { BookRows } from './BookRows';

// A group's books (a month's, a decade's) in a drawer, from the bottom on
// a phone, where nothing's hovered, as the feed opens: its name, how
// many, and the books one under another, each its cover, title and
// author (and `detail`), to open
export function BooksDrawer({
  open,
  title,
  books,
  onClose,
  detail,
}: {
  open: boolean;
  title: string;
  books: Book[];
  onClose: () => void;
  detail?: (book: Book) => string;
}) {
  return (
    <Drawer open={open} onClose={onClose} title={title}>
      <div className='px-6 pb-6 pt-4'>
        <p className={`mb-2 ${labelClass}`}>{counted(books.length, 'book')}</p>
        <BookRows books={books} detail={detail} />
      </div>
    </Drawer>
  );
}
