import type { ReadingState } from '@/entities/book/types';
import {
  dayOf,
  formatOf,
  isbnOf,
  namesOf,
  plainOf,
  starsOf,
  titleOf,
} from './fields';
import type { Imported } from './imported';

// How far a StoryGraph reader got, as alcove has it: a book put down
// unfinished, or paused, counted as not read, as alcove has no word for it
const states: Record<string, ReadingState> = {
  read: 'read',
  'currently-reading': 'reading',
  'to-read': 'unread',
  'did-not-finish': 'unread',
  paused: 'reading',
};

// Whether an export is StoryGraph's: by the columns only it has
export const isStoryGraph = (columns: string[]) =>
  columns.includes('Read Status') && columns.includes('ISBN/UID');

// The days of the last reading StoryGraph has: "2023/01/05-2023/02/10",
// several of them one after another with commas
function lastReading(value: string | undefined) {
  const last = value?.split(',').at(-1)?.trim();
  if (!last) return {};
  const [started, finished] = last.split(/\s*-\s*(?=\d{4})/);
  return { started: dayOf(started), finished: dayOf(finished) };
}

// A row of StoryGraph's export (Manage Account, Export StoryGraph Library)
// as a book to bring over: the title, its writers, its ISBN (StoryGraph's
// own ids left out), the format, and the reader's own part (how far they
// got, the days of their last reading, stars and review)
export function fromStoryGraph(row: Record<string, string>): Imported {
  const status = row['Read Status']?.trim() ?? '';
  const reading = states[status] ?? 'unread';
  const { format, nonPhysical } = formatOf(row['Format']);
  const days = lastReading(row['Dates Read']);
  return {
    wanted: status === 'to-read',
    added: dayOf(row['Date Added']),
    book: {
      ...titleOf(row['Title'] ?? ''),
      authors: namesOf(row['Authors']),
      isbn: isbnOf(row['ISBN/UID']),
      format,
      copy: {
        status: 'shelf',
        nonPhysical,
        reading,
        started: reading === 'unread' ? undefined : days.started,
        finished:
          reading === 'read'
            ? (days.finished ?? dayOf(row['Last Date Read']))
            : undefined,
        rating: starsOf(row['Star Rating']),
        review: plainOf(row['Review']),
        notes: status === 'did-not-finish' ? ['Didn’t finish it.'] : undefined,
      },
    },
  };
}
