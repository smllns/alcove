import { useMemo } from 'react';
import { isPhysical } from '@/entities/book/nonPhysical';
import type { Book } from '@/entities/book/types';
import type { Shelf } from '@/entities/book/useShelf';
import { Loading } from '@/shared/ui/Loading';
import { SectionIntro } from '../SectionIntro';
import { Almanac, type Part } from './Almanac';
import { DecadePiles } from './DecadePiles';
import { GenreLedger } from './GenreLedger';
import { cameOn, finishedOn } from './growth';
import { AuthorsLedger, LanguagesLedger } from './Ledgers';
import { authors, byDecade, extremes, tally } from './libraryStats';
import { MonthsChapter } from './MonthsChapter';
import * as say from './sayings';
import { StackChapter } from './StackChapter';
import { ToScale } from './ToScale';

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
    }),
    [books],
  );
  const parts: (Part | false | null)[] = [
    shelved.length > 0 && {
      key: 'books',
      title: 'Books and pages',
      body: (
        <StackChapter books={shelved} left={books.length - shelved.length} />
      ),
    },
    shelved.length > 0 && {
      key: 'arrivals',
      title: 'How the library grew',
      body: <MonthsChapter books={shelved} dayOf={cameOn} />,
    },
    {
      key: 'read',
      title: 'Read each month',
      body: <MonthsChapter books={found.read} dayOf={finishedOn} read />,
    },
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
      body: <GenreLedger genres={found.genres} />,
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
    found.extremes && {
      key: 'extremes',
      title: 'Longest and shortest',
      say: say.thickest(found.extremes),
      body: <ToScale found={found.extremes} />,
    },
  ];
  return (
    <Almanac
      parts={parts.filter((part): part is Part => Boolean(part))}
      total={books.length}
    />
  );
}
