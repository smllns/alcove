import type { Book, NonPhysicalWay } from './types';

// How a book the reader doesn't have on their shelves was read, as it
// reads to them
export const nonPhysicalWays: { value: NonPhysicalWay; label: string }[] = [
  { value: 'ebook', label: 'E-book' },
  { value: 'audiobook', label: 'Audiobook' },
  { value: 'borrowed', label: 'Borrowed' },
  { value: 'library', label: 'Library' },
  { value: 'gone', label: 'Once owned' },
];

export const nonPhysicalLabel = (way: NonPhysicalWay) =>
  nonPhysicalWays.find((one) => one.value === way)?.label ?? way;

// A book that stands somewhere: one of the reader's own, on their shelves
// (or lent out), not one read without having it
export const isPhysical = (book: Book) => !book.copy?.nonPhysical;
