import { counted } from '@/shared/lib/plural';
import { Mark } from './Chapter';
import type { Tally } from '@/entities/book/tallies';
import type { byCondition } from './copyStats';
import { inWords } from './words';

// The sentences the chapters on the copies open with (sayings, for the
// rest)

// Each shape as the sentence says a book is in it (by its value in
// entities/book/conditions)
const shapes: Record<string, string> = {
  new: 'like new',
  good: 'in good shape',
  worn: 'well-read',
  battered: 'falling apart',
};

export function keptIn(found: ReturnType<typeof byCondition>, total: number) {
  const top = found.rows.reduce((most, row) =>
    row.books.length > most.books.length ? row : most,
  );
  // How the commonest shape stands against half the books told
  const share = (top.books.length * 2) / found.told;
  const apart = found.rows.find((row) => row.value === 'battered');
  const which =
    found.told < total
      ? `Of the ${counted(found.told, 'book')} you’ve said the shape of, `
      : 'Of your books, ';
  return (
    <>
      {which}
      {share > 1 ? 'most are' : share === 1 ? 'half are' : 'more are'}{' '}
      <Mark>{shapes[top.value]}</Mark>
      {share < 1 && ' than anything else'}.
      {apart && apart !== top && (
        <>
          {' '}
          <Mark>{counted(apart.books.length, 'book')}</Mark>{' '}
          {apart.books.length === 1 ? 'is' : 'are'} falling apart, loved the
          hardest.
        </>
      )}
    </>
  );
}

export function publishedBy(rows: Tally[]) {
  return (
    <>
      Your books come from <Mark>{inWords(rows.length)} publishers</Mark>,{' '}
      <Mark>{rows[0].name}</Mark> most of all, with{' '}
      {counted(rows[0].books.length, 'book')}.
    </>
  );
}

// What's said of the books that came each way, one of them and several
// (by the way's value in entities/book/acquired)
const cameAs: Record<string, [string, string]> = {
  bought: ['you bought', 'you bought'],
  gift: ['was a gift', 'were gifts'],
  inherited: ['you inherited', 'you inherited'],
  found: ['you found', 'you found'],
  swapped: ['you swapped', 'you swapped'],
  other: ['came another way', 'came another way'],
};
type Way = Tally & { value: string };
const came = ({ value, books }: Way) => (
  <>
    <Mark>{books.length.toLocaleString('en')}</Mark>{' '}
    {(cameAs[value] ?? cameAs.other)[books.length === 1 ? 0 : 1]}
  </>
);

// How the books came, said after the months: the two commonest ways
export function cameBy(rows: Way[]) {
  if (!rows.length) return null;
  return (
    <>
      {' '}
      Of all your books, {came(rows[0])}
      {rows[1] && <>, and {came(rows[1])}</>}.
    </>
  );
}
