import type { Book } from '@/entities/book/types';
import { BookCover } from '@/entities/book/ui/BookCover';
import { cn } from '@/shared/lib/cn';
import { useLongPress } from '@/shared/lib/useLongPress';
import { PickMark } from '@/shared/ui/PickMark';
import { raisedClass } from '@/shared/ui/surfaces';
import { BookLink } from '../../views/BookLink';
import { useArrangingHere } from './arranging';

// One book standing face out on a shelf (CoverShelf). Pointed at, it comes
// up a little with its title and author under it, and opens its page, its
// cover flying over to it; found from its page (data-found, useFoundBook),
// it does so for a moment, ringed. Held on, it starts the room arranging
// with it picked; while arranging, a tap picks it or lets it go, rather
// than opening it, a ring round it and its mark filled once it's picked.
// Moved, it goes and comes as useBookMoves has it.
export function ShelfBook({ book }: { book: Book }) {
  const arranging = useArrangingHere();
  const picked = arranging?.picked.has(book.id) ?? false;
  const press = useLongPress(() => arranging?.start(book.id));
  const author = book.authors.join(', ');
  return (
    <li
      data-book={book.id}
      // Pointed at, over every book and sheet round it, its caption too
      className={cn(
        'group relative select-none [-webkit-touch-callout:none] hover:z-20 focus-within:z-20 data-found:z-20 max-sm:w-[calc(25%-0.5625rem)]',
        // While the room's arranged, on a layer of its own all along, so
        // gliding to a new place never redraws it, shadow and all, as it
        // starts and stops
        arranging?.on && 'will-change-transform',
      )}
      {...(arranging && press.handlers)}
      onClickCapture={(e) => {
        if (!arranging) return;
        const held = press.heard();
        if (!arranging.on && !held) return;
        e.preventDefault();
        e.stopPropagation();
        if (!held) arranging.toggle(book.id);
      }}
    >
      <BookLink
        id={book.id}
        aria-label={`${book.title}, ${author}`}
        aria-pressed={arranging?.on ? picked : undefined}
        draggable={false}
        className='block'
      >
        <BookCover
          title={book.title}
          author={author}
          url={book.cover?.url}
          bookId={book.id}
          // As in the grid, so most often in already
          size='L'
          className={cn(
            'w-full shadow-[0_8px_14px_-10px_rgb(var(--shade)/calc(0.5*var(--shade-k)))] ring-offset-3 ring-offset-(--bg-mid) transition-[translate,box-shadow] duration-500 ease-soft group-data-found:-translate-y-1.5 group-data-found:ring-2 group-data-found:ring-ink/50 sm:w-18',
            // Lifted as it's pointed at, unless the room's being arranged:
            // books gliding under the pointer would lift and drop, their
            // shadows jumping; then lifted as it's picked instead
            arranging?.on
              ? picked && '-translate-y-1.5 ring-2 ring-ink'
              : 'group-hover:-translate-y-1.5',
          )}
        />
        {arranging?.on && <PickMark picked={picked} />}
      </BookLink>
      <div
        aria-hidden
        className={cn(
          'pointer-events-none absolute left-1/2 top-full z-10 mt-2 w-48 -translate-x-1/2 rounded-xl px-3 py-2 text-center opacity-0 transition-opacity duration-300 ease-soft group-hover:opacity-100 group-data-found:opacity-100',
          raisedClass,
        )}
      >
        <p className='line-clamp-2 font-serif text-sm leading-snug text-ink'>
          {book.title}
        </p>
        <p className='mt-0.5 line-clamp-1 text-xs text-muted'>{author}</p>
      </div>
    </li>
  );
}
