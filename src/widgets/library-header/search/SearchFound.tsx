import type { CatalogueWork } from '@/entities/book/types';
import type { ListOpenState } from '@/entities/list/types';
import { ListsFound } from './ListsFound';
import { AuthorRow, OwnBookRow, ReaderRow, WorkRow } from './ResultRows';
import { SearchSection } from './SearchSection';
import type { Found, SearchKind } from './useSearch';

// How many of each are shown among everything found; looking for that
// kind alone shows them all
const FEW = { own: 4, works: 4, authors: 3, lists: 3, readers: 3 };

// What a search found, a section for each kind of thing, or a word on
// what can be looked for while there's nothing asked yet
export function SearchFound({
  found,
  query,
  kind,
  onKind,
  onBook,
  onWork,
  onAuthor,
  onList,
}: {
  found: Found;
  query: string;
  kind: SearchKind;
  onKind: (kind: SearchKind) => void;
  onBook: (id: string) => void;
  // A book from the catalogue not on the shelves: its page
  onWork: (work: CatalogueWork) => void;
  onAuthor: (name: string) => void;
  onList: (to: string, state?: ListOpenState) => void;
}) {
  const some = kind === 'all' && !found.readersOnly;
  // The first few, with a way to the rest when there are more
  const shown = <T,>(items: T[], few: number, of: SearchKind) => ({
    items: some ? items.slice(0, few) : items,
    more: some && items.length > few ? () => onKind(of) : undefined,
  });

  if (!found.asked)
    return (
      <p className='mx-auto max-w-sm animate-arrive px-6 py-14 text-center text-sm leading-6 text-muted'>
        Your own books, every book there is, readers (start with @), authors and
        lists, all from here.
      </p>
    );

  const own = shown(found.own, FEW.own, 'books');
  const works = shown(found.works, FEW.works, 'books');
  const readers = shown(found.readers, FEW.readers, 'people');
  const authors = shown(found.authors, FEW.authors, 'authors');
  const nothing =
    !found.looking &&
    [own, works, authors, readers].every((x) => !x.items.length) &&
    !found.lists.some;

  return (
    <>
      <SearchSection
        title='In your library'
        loading={found.loading.own}
        waiting='Looking through your shelves…'
        count={own.items.length}
        onMore={own.more}
      >
        {own.items.map((book, i) => (
          <OwnBookRow
            key={book.id}
            book={book}
            order={i}
            onOpen={() => onBook(book.id)}
          />
        ))}
      </SearchSection>
      <SearchSection
        title='All books'
        loading={found.loading.works}
        waiting='Looking in the catalogue…'
        count={works.items.length}
        onMore={works.more}
      >
        {works.items.map((work, i) => {
          const mine = found.owned.get(work.workKey)?.id;
          return (
            <WorkRow
              key={work.workKey}
              work={work}
              order={i}
              owned={Boolean(mine)}
              onOpen={() => (mine ? onBook(mine) : onWork(work))}
            />
          );
        })}
      </SearchSection>
      <SearchSection
        title='Authors'
        loading={found.loading.authors}
        waiting='Looking for writers…'
        count={authors.items.length}
        onMore={authors.more}
      >
        {authors.items.map((author, i) => (
          <AuthorRow
            key={author.key}
            author={author}
            order={i}
            onOpen={() => onAuthor(author.name)}
          />
        ))}
      </SearchSection>
      <ListsFound
        found={found.lists}
        few={some ? FEW.lists : undefined}
        onSeeAll={some ? () => onKind('lists') : undefined}
        onOpen={onList}
      />
      <SearchSection
        title='Readers'
        loading={found.loading.readers}
        waiting='Looking for readers…'
        count={readers.items.length}
        onMore={readers.more}
      >
        {readers.items.map((reader, i) => (
          <ReaderRow key={reader.username} reader={reader} order={i} />
        ))}
      </SearchSection>
      {nothing && (
        <p className='animate-arrive px-6 py-14 text-center text-sm text-muted'>
          Nothing found for “{query}”.
        </p>
      )}
    </>
  );
}
