import type { CSSProperties } from 'react';
import { clothFor } from '@/entities/book/coverImage';
import type { Book } from '@/entities/book/types';
import { cn } from '@/shared/lib/cn';
import { nativeName } from '@/entities/book/languages';
import { HOVER, useMediaQuery } from '@/shared/lib/useMediaQuery';
import { BooksDrawer } from './BooksDrawer';
import { LedgerRow, LedgerWithMore } from './Ledger';
import { AVERAGE_PAGES } from './libraryStats';
import type { Tally } from './tallies';
import { RisingSpine } from './ToneSpine';
import { useBooksDrawer } from './useBooksDrawer';

// The most of an author's books drawn after their number, fewer on a phone
const SPINES = 14;
const SPINES_PHONE = 8;

// The authors with the most books, each with their books drawn small
// after how many, the rest opening out under them (LedgerWithMore); an
// author's books open as a month's do (HoverBooks), their spines rising a
// touch as they're pointed at
export function AuthorsLedger({ authors }: { authors: Tally[] }) {
  const hover = useMediaQuery(HOVER);
  const drawer = useBooksDrawer();
  const open = (author: Tally) => drawer.show(author.name, author.books);
  return (
    <>
      <LedgerWithMore
        items={authors}
        noun='author'
        hover={hover}
        onOpen={open}
        row={(author, fine) => (
          <LedgerRow
            key={author.name}
            name={author.name}
            value={author.books.length}
            fine={fine}
            books={author.books}
            hover={hover}
            onOpen={() => open(author)}
            after={!fine && <Spines books={author.books} />}
          />
        )}
      />
      {!hover && <BooksDrawer {...drawer} />}
    </>
  );
}

// An author's books drawn small after how many, as thick as their pages,
// in a row as wide as the most it holds, so the numbers line up
function Spines({ books }: { books: Book[] }) {
  return (
    <span className='ml-1 flex h-4 w-[39px] shrink-0 items-end gap-px self-center sm:w-[69px]'>
      {books.slice(0, SPINES).map((book, i) => (
        <RisingSpine
          key={book.id}
          book={book}
          height={10 + (book.pages ?? AVERAGE_PAGES) / 120}
          small
          className={cn('w-1', i >= SPINES_PHONE && 'max-sm:hidden')}
        />
      ))}
    </span>
  );
}

// The languages the books were first written in, each named in itself,
// how much of the library each is shown as a strip across over them, the
// rest opening out under them; a language's books open as an author's do
export function LanguagesLedger({ languages }: { languages: Tally[] }) {
  const hover = useMediaQuery(HOVER);
  const drawer = useBooksDrawer();
  const open = (language: Tally) =>
    drawer.show(nativeName(language.name), language.books);
  const tone = (code: string) =>
    ({
      backgroundColor: `color-mix(in oklab, ${clothFor(code)} 78%, var(--bg-mid))`,
    }) as CSSProperties;
  return (
    <>
      {languages.length > 1 && (
        <div className='mt-1 mb-1.5 flex h-2.5 gap-0.5 overflow-hidden rounded-[2px]'>
          {languages.map((language) => (
            <span
              key={language.name}
              style={{ ...tone(language.name), flex: language.books.length }}
            />
          ))}
        </div>
      )}
      <LedgerWithMore
        items={languages}
        noun='language'
        hover={hover}
        onOpen={open}
        named={(language) => nativeName(language.name)}
        row={(language, fine) => (
          <LedgerRow
            key={language.name}
            name={nativeName(language.name)}
            value={language.books.length}
            fine={fine}
            books={language.books}
            hover={hover}
            onOpen={() => open(language)}
          />
        )}
      />
      {!hover && <BooksDrawer {...drawer} />}
    </>
  );
}
