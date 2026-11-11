import { counted } from '@/shared/lib/plural';
import { Mark } from './Chapter';
import { countIn, type Tally } from '@/entities/book/tallies';
import type { byReading, byStars } from './readingStats';
import { inWords, tallness } from './words';

// The sentences the chapters on reading open with (sayings, for the rest)

export function stillToRead(found: ReturnType<typeof byReading>) {
  if (!found.unread)
    return (
      <>
        You’ve read <Mark>every book</Mark> you have.
      </>
    );
  const since = found.waiting?.copy?.acquired?.date?.slice(0, 4);
  return (
    <>
      <Mark>{counted(found.unread, 'book')}</Mark>{' '}
      {found.unread === 1 ? 'is' : 'are'} still waiting to be read
      {found.height > 0 && (
        <>
          , a stack <Mark>{tallness(found.height)}</Mark> high
        </>
      )}
      .
      {found.waiting && since && (
        <>
          {' '}
          The one waiting longest is <Mark>{found.waiting.title}</Mark>, here
          since {since}.
        </>
      )}
    </>
  );
}

export function starsGiven(found: NonNullable<ReturnType<typeof byStars>>) {
  return (
    <>
      You give <Mark>{found.average} stars</Mark> on average
      {found.five > 0 && (
        <>
          , and <Mark>{counted(found.five, 'book')}</Mark> got all five
        </>
      )}
      .
    </>
  );
}

// How the books read another way were read, as the sentence says it
const ways: Record<string, string> = {
  'E-book': 'as e-books',
  Audiobook: 'as audiobooks',
  Borrowed: 'borrowed',
  Library: 'from a library',
  'Once owned': 'once your own and since gone',
};

export function readAnotherWay(rows: Tally[]) {
  const other = rows.filter((row) => row.name !== 'On your shelves');
  const many = countIn(other);
  return (
    <>
      <Mark>{counted(many, 'book')}</Mark> you read without keeping{' '}
      {many === 1 ? 'it' : 'them'} on your shelves
      {many > 1 && (
        <>
          , {other.length === 1 ? 'all' : 'most'} of them{' '}
          <Mark>{ways[other[0].name]}</Mark>
        </>
      )}
      .
    </>
  );
}

export function startToFinish(average: number, atOnce: number) {
  return (
    <>
      A book takes you <Mark>{counted(average, 'day')}</Mark> on average
      {atOnce > 1 ? (
        <>
          , and at most you were reading <Mark>{inWords(atOnce)} at once</Mark>
        </>
      ) : (
        <>, one book at a time</>
      )}
      .
    </>
  );
}

// Under the pages of a year, the books finished in it with no pages given,
// which they leave out: none of them given, or how many aren't
export function unpagedNote(unpaged: number, finished: number, year: number) {
  if (!unpaged) return null;
  if (unpaged === finished)
    return (
      <>
        None of the books you finished in {year} has its pages given. Add them
        in a book’s details to see the pages here.
      </>
    );
  return (
    <>
      {counted(unpaged, 'book')} you finished in {year}{' '}
      {unpaged === 1 ? 'has' : 'have'} no pages given, so{' '}
      {unpaged === 1 ? 'its' : 'their'} pages aren’t counted. Add them in a
      book’s details.
    </>
  );
}
