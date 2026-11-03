import { counted } from '@/shared/lib/plural';
import { Mark } from './Chapter';
import { countIn, type Tally } from './tallies';
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
          . At most you were reading <Mark>{inWords(atOnce)} at once</Mark>
        </>
      ) : (
        <>. You read one book at a time</>
      )}
      .
    </>
  );
}
