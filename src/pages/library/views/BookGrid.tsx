import type { Book } from '@/entities/book/types';
import { cn } from '@/shared/lib/cn';
import { useLongPress } from '@/shared/lib/useLongPress';
import { BookCard, type CardSize } from './BookCard';
import { MoreBooks, type Paging } from './MoreBooks';
import { shelfItem } from './shelfItem';

// Fixed-width columns, as many as there's room for; a short shelf sits
// centred. Phones get a set number of columns instead.
const columns: Record<CardSize, string> = {
  S: 'grid-cols-3 gap-x-4 gap-y-7 sm:grid-cols-[repeat(auto-fit,7.5rem)] sm:gap-x-6',
  M: 'grid-cols-2 gap-x-5 gap-y-9 sm:grid-cols-[repeat(auto-fit,10.5rem)] sm:gap-x-7',
  L: 'grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-[repeat(auto-fit,14rem)] sm:gap-x-9',
};

// Books that can be picked rather than opened (as in a room being
// arranged): whether they're being picked (`on`), those picked so far, a
// tap then picking a book or letting it go, and a book held on starting
// it all with that book picked
type Picking = {
  on: boolean;
  picked: ReadonlySet<string>;
  toggle: (id: string) => void;
  start: (id: string) => void;
};

// Covers in a grid, small, medium or large
export function BookGrid({
  books,
  size,
  rise = true,
  faded,
  start = false,
  removable,
  picking,
  paging,
}: {
  books: Book[];
  size: CardSize;
  // Cards rise into place, unless they've already eased in (all of them,
  // or those it's said of)
  rise?: boolean | ((book: Book) => boolean);
  // Books to fade back, so the others stand out
  faded?: (book: Book) => boolean;
  // From the left, as text is, rather than centred (on a sheet, say)
  start?: boolean;
  // Each with its × to take it off the shelves (BookCard)
  removable?: boolean;
  picking?: Picking;
  // More to load as the last comes into view, when there's more
  paging?: Paging;
}) {
  return (
    <>
      <ul className={cn('grid', !start && 'sm:justify-center', columns[size])}>
        {books.map((book, i) => (
          <GridBook
            key={book.id}
            book={book}
            size={size}
            removable={removable}
            picking={picking}
            {...shelfItem(book.id, i, {
              rise: typeof rise === 'function' ? rise(book) : rise,
              step: 45,
              faded: faded?.(book),
            })}
          />
        ))}
      </ul>
      {paging && <MoreBooks {...paging} />}
    </>
  );
}

// One book in the grid, its place in it as shelfItem has it. Held on, when
// books can be picked, it starts them being picked with it picked; while
// they are, a tap picks it or lets it go rather than opening it.
function GridBook({
  book,
  size,
  removable,
  picking,
  className,
  style,
}: {
  book: Book;
  size: CardSize;
  removable?: boolean;
  picking?: Picking;
} & ReturnType<typeof shelfItem>) {
  const press = useLongPress(() => picking?.start(book.id));
  const on = picking?.on ?? false;
  return (
    <li
      // For books going and coming to be found (useBookMoves)
      data-book={book.id}
      style={style}
      className={cn(
        className,
        // Held on, no picture to save or text to select
        picking && 'select-none [-webkit-touch-callout:none]',
        // While books are picked, each on a layer of its own all along, so
        // gliding to a new place never redraws it
        on && 'will-change-transform',
      )}
      {...(picking && press.handlers)}
      onClickCapture={(e) => {
        if (!picking) return;
        const held = press.heard();
        if (!picking.on && !held) return;
        e.preventDefault();
        e.stopPropagation();
        if (!held) picking.toggle(book.id);
      }}
    >
      <BookCard
        book={book}
        size={size}
        removable={removable}
        picked={on ? picking?.picked.has(book.id) : undefined}
      />
    </li>
  );
}
