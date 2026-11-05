import { useMemo } from 'react';
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
import { byCondition, publishers } from './copyStats';
import { byArrival } from './growth';
import { AuthorsLedger, LanguagesLedger } from './Ledgers';
import { authors, byDecade, extremes } from './libraryStats';
import { tally } from './tallies';
import { MonthsChapter } from './MonthsChapter';
import * as words from './readingSayings';
import { byReading, byStars, byWay } from './readingStats';
import { ReadingChapter } from './ReadingChapter';
import { readSpans } from './readingYears';
import * as say from './sayings';
import { StackChapter } from './StackChapter';
import { LengthPiles } from './LengthPiles';

// What the reader's library says about them, as an almanac: chapter after
// chapter down the page, each one sentence and one drawing, in the places'
// hand. A chapter with nothing to go on (no genres given, no pages known)
// is left out, and the rest numbered on. Each chapter counts what it's
// about: the books as things (how tall they'd stack, how they came) only
// the physical ones; what was read and the reader's taste every book,
// read on a screen or listened to as much as on paper.
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
      decades: byDecade(books),
      genres: tally(books, (book) => book.genres ?? []),
      authors: authors(books),
      // The language each was first written in (its own, for one that
      // isn't a translation)
      languages: tally(books, (book) => {
        const first = book.originalLanguage ?? book.language;
        return first ? [first] : [];
      }),
      extremes: extremes(books),
      read: books.filter((book) => book.copy?.reading === 'read'),
      spans: readSpans(books),
      reading: byReading(books),
      stars: byStars(books),
      ways: byWay(books),
      arrival: byArrival(shelved),
      condition: byCondition(shelved),
      publishers: publishers(shelved),
    }),
    [books, shelved],
  );
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
    found.extremes && {
      key: 'extremes',
      title: 'Longest and shortest',
      say: say.thickest(found.extremes),
      body: <LengthPiles found={found.extremes} />,
    },
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
    // Only once some publisher has more than one of them
    (found.publishers[0]?.books.length ?? 0) > 1 && {
      key: 'publishers',
      title: 'Publishers',
      say: kept.publishedBy(found.publishers),
      body: <SpineLedger rows={found.publishers} noun='publisher' ranked />,
    },
  ]);
  const reading = shown([
    {
      key: 'read',
      title: 'Your reading year',
      body: <ReadingChapter books={found.read} spans={found.spans} />,
    },
    {
      key: 'unread',
      title: 'Still to read',
      say: words.stillToRead(found.reading),
      body: <SpineLedger rows={found.reading.rows} noun='state' />,
    },
    found.stars && {
      key: 'stars',
      title: 'Your stars',
      say: words.starsGiven(found.stars),
      body: <SpineLedger rows={found.stars.rows} noun='rating' />,
    },
    // Only once some book was read another way than off the shelves
    found.ways.length > 1 && {
      key: 'ways',
      title: 'How you read',
      say: words.readAnotherWay(found.ways),
      body: <SpineLedger rows={found.ways} noun='way' />,
    },
  ]);
  const inside = shown([
    found.decades && {
      key: 'decades',
      title: 'By decade',
      say: say.spanned(found.decades),
      body: <DecadePiles decades={found.decades} />,
    },
    found.genres.length > 0 && {
      key: 'genres',
      title: 'Genres',
      say: say.leaning(found.genres),
      body: <SpineLedger rows={found.genres} noun='genre' ranked />,
    },
    // Only once someone's written more than one of them
    (found.authors[0]?.books.length ?? 0) > 1 && {
      key: 'authors',
      title: 'Favourite authors',
      say: say.favourite(found.authors[0]),
      body: <AuthorsLedger authors={found.authors} />,
    },
    found.languages.length > 0 && {
      key: 'languages',
      title: 'Original languages',
      say: say.spoken(found.languages),
      body: <LanguagesLedger languages={found.languages} />,
    },
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
