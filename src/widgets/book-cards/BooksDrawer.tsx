import type { Book } from '@/entities/book/types';
import { counted } from '@/shared/lib/plural';
import { Drawer } from '@/shared/ui/Drawer';
import { labelClass } from '@/shared/ui/fieldStyles';
import { ButtonLink } from '@/shared/ui/ButtonLink';
import { BookRows } from './BookRows';
import type { GroupPage } from './useBooksDrawer';

// A group's books (a month's, a decade's) in a drawer, from the bottom on
// a phone, where nothing's hovered, as the feed opens: its name, how
// many, and the books one under another, each its cover, title and
// author (and `detail`), to open; and the way to the group's own `page`,
// if it has one
export function BooksDrawer({
  open,
  title,
  books,
  onClose,
  detail,
  page,
}: {
  open: boolean;
  title: string;
  books: Book[];
  onClose: () => void;
  detail?: (book: Book) => string;
  page?: GroupPage;
}) {
  return (
    <Drawer open={open} onClose={onClose} title={title}>
      <div className='px-6 pb-6 pt-4'>
        {/* A button of its own, first, as large as a thumb wants */}
        {page && (
          <ButtonLink
            to={page.to}
            variant='primary'
            arrow
            className='mb-5 w-full'
          >
            {page.label}
          </ButtonLink>
        )}
        <p className={`mb-2 ${labelClass}`}>{counted(books.length, 'book')}</p>
        <BookRows books={books} detail={detail} />
      </div>
    </Drawer>
  );
}
