import type { Book } from '@/entities/book/types';
import { cn } from '@/shared/lib/cn';
import { counted } from '@/shared/lib/plural';
import { pagesIn } from '@/entities/book/pages';
import { ScaleHeading } from '@/shared/ui/ScaleHeading';

// How deep the month with the most pages hangs
const DEEPEST = 56;

// A month's pages written short enough for a phone's narrow bay: "1.2K"
const short = new Intl.NumberFormat('en', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

// The pages read each month of a year, under its shelf of books and the months
// they share: from a plank like the shelf's, each month's pages hang as a block
// of leaves, as deep as they're many, its edges ruled as a book's are, and
// under them all, in a row, how many (gold, the most), as the books' counts
// stand over them; the months still to come pale and empty. Under it, the
// year's pages in all and a month's on average. Counting each book's pages in
// the month it was finished, and only books whose pages are known; left out
// when none are.
export function MonthPages({
  months,
  soFar,
}: {
  months: Book[][];
  // How many of the months have come
  soFar: number;
}) {
  const pages = months.map(pagesIn);
  const total = pagesIn(months.flat());
  if (!total) return null;
  const most = Math.max(...pages);
  return (
    <div className='mt-3'>
      <div className='stats-plank' />
      <div className='grid grid-cols-12 items-start gap-x-1.5'>
        {pages.map((count, m) => (
          <span
            key={m}
            className={cn(
              'flex flex-col items-center',
              m >= soFar && 'opacity-35',
            )}
          >
            <span
              className='flex w-full justify-center'
              style={{ height: DEEPEST }}
            >
              {count > 0 && (
                <span
                  className='month-pages block w-3/5 max-w-6 rounded-b-[2px]'
                  style={{ height: Math.max(3, (count / most) * DEEPEST) }}
                />
              )}
            </span>
            <span
              className={cn(
                'mt-1.5 font-serif text-xs leading-none whitespace-nowrap sm:text-[0.8125rem]',
                count === most ? 'text-gold-ink' : 'text-muted',
              )}
            >
              {m < soFar ? (count ? short.format(count) : '—') : ' '}
            </span>
          </span>
        ))}
      </div>
      <ScaleHeading name='Pages' className='mt-5'>
        {counted(total, 'page')} · about{' '}
        {Math.round(total / Math.max(1, soFar)).toLocaleString('en')} a month
      </ScaleHeading>
    </div>
  );
}
