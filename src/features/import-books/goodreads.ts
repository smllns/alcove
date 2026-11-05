import type { ReadingState } from '@/entities/book/types';
import {
  dayOf,
  formatOf,
  isbnOf,
  namesOf,
  plainOf,
  starsOf,
  text,
  titleOf,
  wholeOf,
} from './fields';
import type { Imported } from './imported';

// The shelf a Goodreads book is on, as alcove has it
const states: Record<string, ReadingState> = {
  read: 'read',
  'currently-reading': 'reading',
  'to-read': 'unread',
};

// Whether an export is Goodreads': by the columns only it has
export const isGoodreads = (columns: string[]) =>
  columns.includes('Exclusive Shelf') && columns.includes('Owned Copies');

// A row of Goodreads' export (My Books, Export Library) as a book to bring
// over: the title with its series taken out, its writers, the printing
// (ISBN, publisher, binding, pages, years), and the reader's own part
// (the shelf, the day it was read, stars, review and notes)
export function fromGoodreads(row: Record<string, string>): Imported {
  const reading = states[row['Exclusive Shelf']?.trim()] ?? 'unread';
  const { format, nonPhysical } = formatOf(row['Binding']);
  const notes = text(row['Private Notes']);
  return {
    wanted: reading === 'unread',
    added: dayOf(row['Date Added']),
    book: {
      ...titleOf(row['Title'] ?? ''),
      authors: [
        ...namesOf(row['Author']),
        ...namesOf(row['Additional Authors']),
      ],
      isbn: isbnOf(row['ISBN13']) ?? isbnOf(row['ISBN']),
      publisher: text(row['Publisher']),
      pages: wholeOf(row['Number of Pages']),
      firstPublishedYear: wholeOf(row['Original Publication Year']),
      publishedYear: wholeOf(row['Year Published']),
      format,
      copy: {
        status: 'shelf',
        nonPhysical,
        reading,
        finished: reading === 'read' ? dayOf(row['Date Read']) : undefined,
        rating: starsOf(row['My Rating']),
        review: plainOf(row['My Review']),
        notes: notes ? [notes] : undefined,
      },
    },
  };
}
