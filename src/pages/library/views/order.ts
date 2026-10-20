import type { Book } from '@/entities/book/types';

// How the grid and the list are ordered (either way round), and which
// books fade back, so the rest stand out without anything being hidden
export type ShelfOrder =
  'added' | 'title' | 'author' | 'rating' | 'read' | 'published';
export type ShelfFade = 'none' | 'read' | 'unread';
// How the shelf is arranged: an order, which way round, and what fades
export type Arrangement = {
  order: ShelfOrder;
  reversed: boolean;
  fade: ShelfFade;
};

// Newest first, nothing faded: how the books come from the server
export const usual: Arrangement = {
  order: 'added',
  reversed: false,
  fade: 'none',
};

// Whether putting the books in order takes all of them, not just the
// pages loaded so far
export const needsEveryBook = ({ order, reversed }: Arrangement) =>
  order !== 'added' || reversed;

// Each with its two ways round, the usual one first
export const orders: {
  value: ShelfOrder;
  label: string;
  ways: [string, string];
}[] = [
  { value: 'added', label: 'Recently added', ways: ['Newest', 'Oldest'] },
  { value: 'title', label: 'Title', ways: ['A–Z', 'Z–A'] },
  { value: 'author', label: 'Author', ways: ['A–Z', 'Z–A'] },
  { value: 'rating', label: 'Rating', ways: ['Highest', 'Lowest'] },
  { value: 'read', label: 'Recently read', ways: ['Latest', 'Earliest'] },
  { value: 'published', label: 'First published', ways: ['Newest', 'Oldest'] },
];

export const fades: { value: ShelfFade; label: string }[] = [
  { value: 'none', label: 'Nothing' },
  { value: 'read', label: 'Books I’ve read' },
  { value: 'unread', label: 'Books I haven’t read' },
];

const collator = new Intl.Collator('en', {
  sensitivity: 'base',
  numeric: true,
});

// A title as it's filed: "The Secret History" under S
const filedTitle = (book: Book) => book.title.replace(/^(the|a|an)\s+/i, '');
// An author as they're filed: by surname, the last word of the name
const surname = (book: Book) => book.authors[0]?.trim().split(/\s+/).at(-1);
// When it first came out; for a book added before that was asked, the
// year it was given
export const publishedIn = (book: Book) =>
  book.firstPublishedYear ?? book.publishedYear;
// When it was last read: finished, or else started
const readOn = (book: Book) => book.copy?.finished ?? book.copy?.started;

const byTitle = (a: Book, b: Book) =>
  collator.compare(filedTitle(a), filedTitle(b));

type Compare = (a: Book, b: Book) => number;

// Compares by `key`, the usual way round (highest first, if `high`) or
// `reversed`. Books without one go last either way; ties go by title.
const by =
  <T extends string | number>(
    key: (book: Book) => T | undefined,
    high: boolean,
  ) =>
  (reversed: boolean): Compare =>
  (a, b) => {
    const x = key(a);
    const y = key(b);
    if (x === undefined || y === undefined)
      return x === y ? byTitle(a, b) : x === undefined ? 1 : -1;
    const order =
      typeof x === 'number'
        ? x - (y as number)
        : collator.compare(x, y as string);
    return (high !== reversed ? -order : order) || byTitle(a, b);
  };

const compare: Record<
  Exclude<ShelfOrder, 'added'>,
  (reversed: boolean) => Compare
> = {
  title: (reversed) => (a, b) => (reversed ? byTitle(b, a) : byTitle(a, b)),
  author: by(surname, false),
  rating: by((book) => book.copy?.rating, true),
  read: by(readOn, true),
  published: by(publishedIn, true),
};

// The books in `order`, maybe `reversed`; newest added first is how they
// come
export const ordered = (books: Book[], order: ShelfOrder, reversed: boolean) =>
  order === 'added'
    ? reversed
      ? books.toReversed()
      : books
    : books.toSorted(compare[order](reversed));

// Whether a book fades back. Fading what hasn't been read leaves the book
// being read now bright: it's well on its way.
export const fadesBack = (book: Book, fade: ShelfFade) => {
  if (fade === 'none') return false;
  const read = book.copy?.reading === 'read';
  return fade === 'read' ? read : !read && book.copy?.reading !== 'reading';
};
