import { copyConditions } from '@/entities/book/conditions';
import type { Book } from '@/entities/book/types';
import { byOption } from '@/entities/book/tallies';

// What the stats say of the copies themselves: the shape they're in (who
// published them: publishers.ts)

// The books by the shape they're in, the best first, those with none given
// left out; and how many have one
export const byCondition = (books: Book[]) =>
  byOption(books, copyConditions, (book) => book.copy?.condition);
