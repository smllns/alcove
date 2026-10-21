import type { CopyDetails } from '@/entities/book/types';
import { fromDay, longDate } from '@/shared/lib/dates';

// A copy's story in short lines, as the book's page tells it

// "3 March 2024", from a stored day
export const dayName = (day: string | undefined) => {
  const date = day ? fromDay(day) : null;
  return date ? longDate(date) : undefined;
};

// Out on loan, in brief, for the top of the page: "Lent to Anna" (the
// dates are in the copy's story further down)
export function loanLine(copy: CopyDetails | undefined) {
  if (!copy || copy.status === 'shelf') return undefined;
  const lent = copy.status === 'lent';
  if (!copy.person) return lent ? 'Lent out' : 'Borrowed';
  return `${lent ? 'Lent to' : 'Borrowed from'} ${copy.person}`;
}
