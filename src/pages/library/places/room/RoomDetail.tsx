import { cn } from '@/shared/lib/cn';
import { captionClass } from '@/shared/ui/fieldStyles';
import type { Book } from '@/entities/book/types';
import { CoverShelf } from '../shelf/CoverShelf';
import { SectionTag } from '../drawing/SectionTag';
import { ShelfSheet } from '../shelf/ShelfSheet';

// One bookcase of a room drawn again on its own, large, as a detail on an
// architect's sheet, tagged as it is in the room's drawing: its name and
// how many books it holds, then each of its shelves on a sheet of its own
// as a book's page is, named and counted over its books standing face
// out. `id`: for its tag in the drawing to lead to it.
export function RoomDetail({
  id,
  tag,
  name,
  count,
  shelves,
}: {
  id: string;
  tag?: string;
  name: string;
  count: number;
  shelves: { key: string; name: string; books: Book[] }[];
}) {
  return (
    <section id={id} className='scroll-mt-28'>
      <h3 className={cn('mb-5 flex items-center gap-3 text-ink', captionClass)}>
        {tag && <SectionTag>{tag}</SectionTag>}
        {name}
        <span
          className={cn('font-normal', count ? 'text-ink-soft' : 'text-faint')}
        >
          {count || 'empty'}
        </span>
      </h3>
      {!shelves.length && (
        <p className='text-sm text-muted'>Nothing in it yet.</p>
      )}
      <div className='flex flex-col gap-4'>
        {shelves.map((shelf) => (
          <ShelfSheet key={shelf.key}>
            <p className={cn('mb-3.5 flex gap-2.5', captionClass)}>
              {shelf.name}
              {shelf.books.length > 0 && (
                <span className='font-normal text-muted'>
                  {shelf.books.length}
                </span>
              )}
            </p>
            {shelf.books.length ? (
              <CoverShelf books={shelf.books} />
            ) : (
              <p className='text-sm text-muted'>Nothing on it yet.</p>
            )}
          </ShelfSheet>
        ))}
      </div>
    </section>
  );
}
