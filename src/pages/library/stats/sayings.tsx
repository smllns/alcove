import type { Book } from '@/entities/book/types';
import { monthOfYear } from '@/shared/lib/dates';
import { languageName } from '@/entities/book/languages';
import { counted } from '@/shared/lib/plural';
import { Mark } from './Chapter';
import type { byDecade, extremes } from './libraryStats';
import type { Tally } from '@/entities/book/tallies';
import { yearOf } from './libraryStats';
import { pagesIn } from '@/entities/book/pages';
import { inWords } from './words';

// The sentence each chapter of the stats opens with, saying in words what
// its drawing shows, the numbers it turns on marked

// "May", "May and August"
const both = (names: string[]) => names.join(' and ');

// What the months say: how many came to the reader in `year` (or how
// many they finished, and how many pages that came to), and the busiest
// month; as many as two months with none, named
export function monthly(
  months: Book[][],
  year: number,
  soFar: number,
  read = false,
) {
  const total = months.flat().length;
  const now = year === new Date().getFullYear();
  // The books finished, and with them, the pages they came to
  const pages = pagesIn(months.flat());
  const books = (
    <>
      <Mark>{counted(total, 'book')}</Mark>
      {read && pages > 0 && (
        <>
          , <Mark>{counted(pages, 'page')}</Mark> in all
        </>
      )}
    </>
  );
  const lead = read ? (
    now ? (
      <>This year you’ve finished {books}</>
    ) : (
      <>
        In {year} you finished {books}
      </>
    )
  ) : now ? (
    <>This year {books} came to you</>
  ) : (
    <>
      In {year}, {books} came to you
    </>
  );
  if (!total) return <>{lead}.</>;
  const most = Math.max(...months.map((each) => each.length));
  const busiest = monthOfYear(months.findIndex((each) => each.length === most));
  const quiet = months
    .slice(0, soFar)
    .flatMap((each, m) => (each.length ? [] : [monthOfYear(m)]));
  return (
    <>
      {lead}. <Mark>{busiest}</Mark>{' '}
      {read ? 'was your busiest month for reading' : 'brought the most'}
      {quiet.length > 0 && quiet.length <= 2
        ? `. ${read ? 'You finished nothing' : 'Nothing came'} in ${both(quiet)}.`
        : '.'}
    </>
  );
}

export function spanned(decades: NonNullable<ReturnType<typeof byDecade>>) {
  const span = yearOf(decades.newest)! - yearOf(decades.oldest)!;
  const busiest = decades.columns
    .filter((column) => !column.older && column.to === undefined)
    .reduce((a, b) => (b.books.length > a.books.length ? b : a));
  if (!span)
    return (
      <>
        {decades.oldest === decades.newest ? 'It' : 'All of them'} came out in{' '}
        <Mark>{yearOf(decades.oldest)}</Mark>.
      </>
    );
  return (
    <>
      Your books span <Mark>{counted(span, 'year')}</Mark>. Most of them came
      out in the <Mark>{busiest.from}s</Mark>.
    </>
  );
}

export function leaning(genres: Tally[]) {
  const [first, ...next] = genres
    .slice(0, 3)
    .map((genre) => genre.name.toLowerCase());
  // Only the one book with a genre given: what it is, not a leaning
  const one = new Set(genres.flatMap((genre) => genre.books)).size === 1;
  return (
    <>
      {one ? 'Your one book is' : 'Your shelves lean towards'}{' '}
      <Mark>{first}</Mark>
      {next.length > 0 && (
        <>
          {one ? (next[1] ? ', ' : ' and ') : ', then '}
          <Mark>{next[0]}</Mark>
          {next[1] && (
            <>
              {' '}
              and <Mark>{next[1]}</Mark>
            </>
          )}
        </>
      )}
      .
    </>
  );
}

export function favourite(author: Tally) {
  return (
    <>
      <Mark>{author.name}</Mark> shows up most, with{' '}
      {counted(author.books.length, 'book')}.
    </>
  );
}

export function spoken(languages: Tally[]) {
  if (languages.length === 1)
    return (
      <>
        {languages[0].books.length === 1 ? 'It was' : 'All of them were'} first
        written in <Mark>{languageName(languages[0].name)}</Mark>.
      </>
    );
  return (
    <>
      Your books were first written in{' '}
      <Mark>{inWords(languages.length)} languages</Mark>.
    </>
  );
}

export function thickest(found: NonNullable<ReturnType<typeof extremes>>) {
  const times = Math.round(found.longest.pages! / found.shortest.pages!);
  if (times < 2)
    return (
      <>
        Your books run much of a length, about{' '}
        <Mark>{counted(found.average, 'page')}</Mark> each.
      </>
    );
  return (
    <>
      Your average book has <Mark>{counted(found.average, 'page')}</Mark>. The
      doorstop is <Mark>{times} times</Mark> thicker than the slimmest.
    </>
  );
}
