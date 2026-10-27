import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';
import { sheetClass } from '@/shared/ui/surfaces';

// A shelf's books on a sheet of their own, as a book's page is. The sheet
// drawn behind them rather than being their box: a sheet blurring what's
// under it is a layer of its own, which the next sheet would cover a
// book's caption with. Growing and shrinking softly as books come and go
// (data-sheet, useBookMoves).
export function ShelfSheet({ children }: { children: ReactNode }) {
  return (
    <div data-sheet className='relative px-5 pb-6 pt-5 sm:px-6'>
      <span aria-hidden className={cn('absolute inset-0', sheetClass)} />
      <div className='relative'>{children}</div>
    </div>
  );
}
