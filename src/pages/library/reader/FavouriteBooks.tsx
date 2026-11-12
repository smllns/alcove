import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { risingCover } from '@/entities/book/coverImage';
import type { Book } from '@/entities/book/types';
import { BookCover } from '@/entities/book/ui/BookCover';
import type { ReaderPage } from '@/entities/reader/types';
import { updateFavourites } from '@/entities/user/api';
import { useAuth, useUserChange } from '@/features/auth';
import { cn } from '@/shared/lib/cn';
import { useDragOrder } from '@/shared/lib/useDragOrder';
import { FormError } from '@/shared/ui/FormError';
import { FavouritePicker } from './FavouritePicker';
import { PagePart } from './PagePart';
import { ReaderBookLink } from './ReaderBookLink';

// Places for favourites, as Letterboxd keeps four
const PLACES = 4;

// The four books a reader would most have others see, first on their page,
// side by side. On their own page, each place left empty chooses one of
// their books (FavouritePicker), each chosen can be taken off, and they're
// put in another order by dragging them (useDragOrder); saved at once,
// shown as chosen meanwhile.
export function FavouriteBooks({
  page,
  owned,
}: {
  page: ReaderPage;
  owned: Map<string, Book>;
}) {
  const { user } = useAuth();
  const { error, run } = useUserChange('That didn’t save.');
  const [picking, setPicking] = useState(false);
  // The reader's own choice as it's being saved
  const [choosing, setChoosing] = useState<string[] | null>(null);
  const ids = choosing ?? user?.favourites ?? [];
  const drag = useDragOrder(ids, (next) => void save(next));
  if (!page.shows.books) return null;
  const books = page.you
    ? drag.order.flatMap(
        (id) => page.books.find((book) => book.id === id) ?? [],
      )
    : page.favourites;
  if (!page.you && !books.length) return null;

  async function save(next: string[]) {
    setChoosing(next);
    await run(() => updateFavourites(next));
    setChoosing(null);
  }

  return (
    <PagePart
      title='Favourite books'
      part='books'
      page={page}
      note={
        page.you
          ? books.length
            ? books.length > 1
              ? 'Drag to reorder.'
              : undefined
            : 'Choose up to four books to show first.'
          : undefined
      }
    >
      <ul ref={drag.box} className='grid grid-cols-4 gap-3 sm:gap-5'>
        {books.map((book) => (
          <li
            key={book.id}
            {...(page.you && drag.item(book.id))}
            className={cn(
              'relative min-w-0',
              page.you && 'cursor-grab select-none',
              drag.dragged === book.id && '[&_.book-cover]:shadow-xl',
            )}
          >
            <ReaderBookLink book={book} owned={owned} className='group block'>
              <BookCover
                title={book.title}
                author={book.authors[0]}
                url={book.coverUrl}
                className={risingCover}
              />
              {/* Only the covers show; the title, for those who hear the page */}
              <span className='sr-only'>{book.title}</span>
            </ReaderBookLink>
            {page.you && (
              <button
                type='button'
                data-no-drag
                aria-label={`Take ${book.title} off your favourites`}
                onClick={() => void save(ids.filter((id) => id !== book.id))}
                className='absolute -right-2 -top-2 grid size-7 cursor-pointer place-items-center rounded-full border border-line bg-surface text-muted shadow-sm transition-colors duration-300 ease-soft hover:text-ink'
              >
                <X size={14} />
              </button>
            )}
          </li>
        ))}
        {page.you &&
          Array.from({ length: PLACES - books.length }, (_, i) => (
            <li key={`empty-${i}`}>
              <button
                type='button'
                aria-label='Choose a favourite book'
                onClick={() => setPicking(true)}
                className='grid aspect-2/3 w-full cursor-pointer place-items-center rounded-[3px] border border-dashed border-line text-muted transition-colors duration-300 ease-soft hover:border-ink hover:text-ink'
              >
                <Plus size={20} />
              </button>
            </li>
          ))}
      </ul>
      <FormError message={error} small className='mt-3' />
      {page.you && (
        <FavouritePicker
          open={picking}
          books={page.books.filter((book) => !ids.includes(book.id))}
          onPick={(id) => {
            setPicking(false);
            void save([...ids, id]);
          }}
          onClose={() => setPicking(false)}
        />
      )}
    </PagePart>
  );
}
