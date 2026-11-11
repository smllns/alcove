import { sources, ways } from '@/entities/book/acquired';
import type { Book } from '@/entities/book/types';
import { counted } from '@/shared/lib/plural';
import type { Tally } from '@/entities/book/tallies';
import { ScaleHeading } from './ScaleHeading';
import { SpineLedger } from './SpineLedger';

// What's said of a book in a way's card: who it was from or where it was
// bought, as the book's details join it on ("At a little shop in Lisbon"),
// or the reader's own words for a way of their own
function cameFrom(book: Book) {
  const { how, from } = book.copy?.acquired ?? {};
  if (!how) return '';
  const words = ways.some((way) => way.value === how)
    ? from && sources[how] && `${sources[how].joiner} ${from}`
    : how;
  return words ? words[0].toUpperCase() + words.slice(1) : '';
}

// How the books came to the reader, under the months they came in: a
// ledger of the ways (bought, a gift, …), the most first, going by every
// year at once and only by the books that say how; over it, how many of
// the books do; in a way's card, who each book was from or where it was
// bought. Left out when none does.
export function ArrivalWays({
  rows,
  told,
  total,
}: {
  rows: Tally[];
  told: number;
  total: number;
}) {
  if (!rows.length) return null;
  return (
    <div className='mt-12'>
      <ScaleHeading name='How they came' className='mb-5'>
        {told < total
          ? `${told.toLocaleString('en')} of your ${counted(total, 'book')}`
          : `all ${counted(total, 'book')}`}
      </ScaleHeading>
      <SpineLedger rows={rows} noun='way' detail={cameFrom} />
    </div>
  );
}
