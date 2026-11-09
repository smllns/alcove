import { useMemo, type ReactNode } from 'react';
import { isPhysical } from '@/entities/book/nonPhysical';
import type { Book } from '@/entities/book/types';
import type { Shelf } from '@/entities/book/useShelf';
import { Loading } from '@/shared/ui/Loading';
import { SectionIntro } from '../SectionIntro';
import { Almanac, type Part } from './Almanac';
import { DecadePiles } from './DecadePiles';
import { SpineLedger } from './SpineLedger';
import { ArrivalWays } from './ArrivalWays';
import * as kept from './copySayings';
import { byCondition } from './copyStats';
import { byArrival } from './growth';
import { AuthorsLedger, LanguagesLedger } from './Ledgers';
import { MonthsChapter } from './MonthsChapter';
import * as words from './readingSayings';
import { byReading, byWay } from './readingStats';
import { ReadingChapter } from './ReadingChapter';
import * as say from './sayings';
import { StackChapter } from './StackChapter';
import { LengthPiles } from './LengthPiles';
import { ScopedChapter } from './ScopedChapter';
import { scopedFindings, type Findings } from './scopedFindings';
import type { ShelfShow } from '../views/order';

// What the reader's library says about them, as an almanac: chapter after
// chapter down the page, each one sentence and one drawing, in the places'
// hand. A chapter with nothing to go on (no genres given, no pages known)
// is left out, and the rest numbered on. Each chapter counts what it's
// about: the books as things (how tall they'd stack, how they came) only
// the physical ones; what was read and the reader's taste every book,
// read on a screen or listened to as much as on paper, or only the
// physical ones, as the reader chooses (ScopedChapter).
export function StatsSection({ shelf }: { shelf: Shelf }) {
  if (!shelf.complete) return <Loading />;
  if (!shelf.all.length)
    return (
      <SectionIntro eyebrow='Stats' title='Your library in numbers'>
        Once there are books on your shelves, here’s what they say about you.
      </SectionIntro>
    );
  return <Chapters books={shelf.all} />;
}

// The chapters, worked out once every book is in
function Chapters({ books }: { books: Book[] }) {
  const shelved = useMemo(() => books.filter(isPhysical), [books]);
  const found = useMemo(
    () => ({
      reading: byReading(books),
      ways: byWay(books),
      arrival: byArrival(shelved),
      condition: byCondition(shelved),
    }),
    [books, shelved],
  );
  // Some chapters count either the physical books or all, when they differ
  const choosing = shelved.length < books.length;
  // Found once among them all, and again among the physical ones only when
  // there are others
  const both = useMemo(() => {
    const all = scopedFindings(books);
    return { all, physical: choosing ? scopedFindings(shelved) : all };
  }, [books, shelved, choosing]);
  // One of those, starting on `start` (if there's anything to show there),
  // left out with nothing to go on among all the books
  const scoped = <K extends keyof Findings>(
    key: K,
    title: string,
    render: (found: NonNullable<Findings[K]>) => {
      say?: ReactNode;
      body: ReactNode;
    },
    start: ShelfShow = 'all',
  ): Part | null => {
    const each = { all: both.all[key], physical: both.physical[key] };
    if (!each.all) return null;
    return {
      key,
      title,
      body: (
        <ScopedChapter
          found={each as Record<ShelfShow, NonNullable<Findings[K]> | null>}
          start={each[start] ? start : 'all'}
          choosing={choosing}
          render={render}
        />
      ),
    };
  };
  // Chapters with nothing to go on are left out
  const shown = (parts: (Part | false | null)[]) =>
    parts.filter((part): part is Part => Boolean(part));
  const library = shown([
    shelved.length > 0 && {
      key: 'books',
      title: 'Books and pages',
      body: (
        <StackChapter books={shelved} left={books.length - shelved.length} />
      ),
    },
    scoped('extremes', 'Longest and shortest', (each) => ({
      say: say.thickest(each),
      body: <LengthPiles found={each} />,
    })),
    shelved.length > 0 && {
      key: 'arrivals',
      title: 'How the library grew',
      body: (
        <>
          <MonthsChapter
            books={shelved}
            more={kept.cameBy(found.arrival.rows)}
          />
          <ArrivalWays {...found.arrival} total={shelved.length} />
        </>
      ),
    },
    found.condition.told > 0 && {
      key: 'condition',
      title: 'What shape they’re in',
      say: kept.keptIn(found.condition, shelved.length),
      body: <SpineLedger rows={found.condition.rows} noun='shape' />,
    },
    scoped(
      'publishers',
      'Publishers',
      (rows) => ({
        say: kept.publishedBy(rows),
        body: <SpineLedger rows={rows} noun='publisher' ranked />,
      }),
      'physical',
    ),
  ]);
  const reading = shown([
    scoped('read', 'Your reading year', (read) => ({
      body: <ReadingChapter books={read.books} spans={read.spans} />,
    })),
    {
      key: 'unread',
      title: 'Still to read',
      say: words.stillToRead(found.reading),
      body: <SpineLedger rows={found.reading.rows} noun='state' />,
    },
    scoped('stars', 'Your stars', (stars) => ({
      say: words.starsGiven(stars),
      body: <SpineLedger rows={stars.rows} noun='rating' />,
    })),
    // Only once some book was read another way than off the shelves
    found.ways.length > 1 && {
      key: 'ways',
      title: 'How you read',
      say: words.readAnotherWay(found.ways),
      body: <SpineLedger rows={found.ways} noun='way' />,
    },
  ]);
  const inside = shown([
    scoped('decades', 'By decade', (decades) => ({
      say: say.spanned(decades),
      body: <DecadePiles decades={decades} />,
    })),
    scoped('genres', 'Genres', (genres) => ({
      say: say.leaning(genres),
      body: <SpineLedger rows={genres} noun='genre' ranked />,
    })),
    scoped('authors', 'Favourite authors', (rows) => ({
      say: say.favourite(rows[0]),
      body: <AuthorsLedger authors={rows} />,
    })),
    scoped('languages', 'Original languages', (languages) => ({
      say: say.spoken(languages),
      body: <LanguagesLedger languages={languages} />,
    })),
  ]);
  return (
    <Almanac
      sections={[
        { title: 'The library', parts: library },
        { title: 'Your reading', parts: reading },
        { title: 'Inside the books', parts: inside },
      ]}
      total={books.length}
    />
  );
}
