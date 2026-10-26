import { cn } from '@/shared/lib/cn';
import { captionClass } from '@/shared/ui/fieldStyles';
import { sheetClass } from '@/shared/ui/surfaces';
import type { Book } from '@/entities/book/types';
import { CoverShelf } from './CoverShelf';
import { SectionTag } from './SectionTag';

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
        <span className='font-normal text-ink-soft'>{count}</span>
      </h3>
      <div className='flex flex-col gap-4'>
        {shelves.map((shelf) => (
          <div key={shelf.key} className='relative px-5 pb-6 pt-5 sm:px-6'>
            {/* The sheet drawn behind it rather than being it: a sheet
                blurring what's under it is a layer of its own, which the
                next sheet would cover a book's caption with */}
            <span aria-hidden className={cn('absolute inset-0', sheetClass)} />
            <div className='relative'>
              <p className={cn('mb-3.5 flex gap-2.5', captionClass)}>
                {shelf.name}
                <span className='font-normal text-muted'>
                  {shelf.books.length}
                </span>
              </p>
              <CoverShelf books={shelf.books} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
