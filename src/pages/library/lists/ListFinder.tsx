import { booksByWork } from '@/entities/book/booksByWork';
import { useRef, useState } from 'react';
import { useCatalogueSearch } from '@/entities/book/catalogueQueries';
import { bookMatches } from '@/entities/book/matches';
import type { Book, CatalogueWork } from '@/entities/book/types';
import { useDebouncedValue } from '@/shared/lib/useDebouncedValue';
import { PHONE, useMediaQuery } from '@/shared/lib/useMediaQuery';
import { OwnBookRow, SearchSection, WorkRow } from '@/widgets/library-header';
import { BookSearch } from '../views/BookSearch';
import { FoundBy } from '../views/FoundPanel';

// The most of the reader's own books found shown at once
const OWN = 5;

// A book to put in a list, looked for by its title or writer as the
// search over everything does, books only: among the reader's own, and in
// Open Library, each part saying so while it looks. Those in the list
// already aren't found; one from the catalogue the reader has a copy of
// is handed over as their copy (`onBook`), any other as the catalogue's
// (`onWork`).
export function ListFinder({
  shelf,
  inList,
  onBook,
  onWork,
  focus,
  className,
}: {
  // Every book of the reader's
  shelf: Book[];
  // The books in the list now
  inList: Book[];
  onBook: (book: Book) => void;
  onWork: (work: CatalogueWork) => void;
  // The cursor in it as it opens
  focus?: boolean;
  className?: string;
}) {
  const field = useRef<HTMLLabelElement>(null);
  const [text, setText] = useState('');
  const [open, setOpen] = useState(false);
  const phone = useMediaQuery(PHONE);
  // Looked for once typing pauses; nothing at once when it's all cleared
  const typed = useDebouncedValue(text.trim(), 300);
  const query = text.trim() ? typed : '';
  const pending = text.trim() !== query;
  const catalogue = useCatalogueSearch(query);

  const ids = new Set(inList.map((book) => book.id));
  const listed = new Set(inList.map((book) => book.openLibrary?.work));
  const copies = booksByWork(shelf);
  const own = query
    ? shelf
        .filter((book) => !ids.has(book.id) && bookMatches(book, query))
        .slice(0, OWN)
    : [];
  const works = query
    ? (catalogue.data?.results ?? []).filter(
        (work) => !listed.has(work.workKey),
      )
    : [];
  const looking = Boolean(query) && (pending || catalogue.isFetching);

  const picked = (pick: () => void) => {
    setOpen(false);
    setText('');
    pick();
  };

  // What's found: the reader's own books, then the catalogue's
  const results = (
    <>
      <SearchSection
        title='In your library'
        loading={pending}
        waiting='Looking through your shelves…'
        count={own.length}
      >
        {own.map((book, i) => (
          <OwnBookRow
            key={book.id}
            book={book}
            order={i}
            action='Add'
            onOpen={() => picked(() => onBook(book))}
          />
        ))}
      </SearchSection>
      <SearchSection
        title='Open Library'
        loading={looking}
        waiting='Looking in Open Library…'
        count={works.length}
      >
        {works.map((work, i) => {
          const copy = copies.get(work.workKey);
          return (
            <WorkRow
              key={work.workKey}
              work={work}
              owned={Boolean(copy)}
              order={i}
              action='Add'
              onOpen={() => picked(() => (copy ? onBook(copy) : onWork(work)))}
            />
          );
        })}
      </SearchSection>
      {!looking && !own.length && !works.length && (
        <p className='animate-arrive px-3 py-6 text-center text-sm text-muted'>
          {catalogue.isError
            ? 'Open Library didn’t answer. Try again in a moment.'
            : 'Nothing found by that name.'}
        </p>
      )}
    </>
  );
  const search = (
    <BookSearch
      ref={field}
      grows={false}
      focus={focus}
      value={text}
      onChange={(next) => {
        setText(next);
        setOpen(true);
      }}
      onFocus={() => setOpen(true)}
      onBlur={phone ? () => setOpen(false) : undefined}
      placeholder='Add a book: yours, or any'
      className={phone ? 'w-full' : className}
    />
  );
  return (
    <FoundBy
      field={search}
      anchor={field}
      open={open && text.trim().length >= 2}
      onClose={() => setOpen(false)}
      width={380}
      className={className}
    >
      {results}
    </FoundBy>
  );
}
