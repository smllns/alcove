import { useState } from 'react';
import { readersListOpening, savedOpening } from '@/entities/list/opening';
import type { ListOpenState } from '@/entities/list/types';
import { paths } from '@/shared/config/paths';
import { counted } from '@/shared/lib/plural';
import { ListRow } from './ListRows';
import { SearchSection } from './SearchSection';
import type { ListsFoundResult } from './useListsFound';

// Lists found (useListsFound), a section for each kind: the reader's own,
// other readers', and Open Library's.
// `few` of each shown, the rest by "See all": all of that kind here, or
// all lists (`onSeeAll`), when that's elsewhere.
export function ListsFound({
  found,
  few,
  onSeeAll,
  onOpen,
}: {
  found: ListsFoundResult;
  few?: number;
  onSeeAll?: () => void;
  onOpen: (to: string, state?: ListOpenState) => void;
}) {
  // The kinds shown whole, for what's asked now
  const [whole, setWhole] = useState<string[]>([]);
  const shown = <T,>(items: T[], kind: string) => {
    const all = !few || whole.includes(kind + found.query);
    return {
      items: all ? items : items.slice(0, few),
      more:
        !all && items.length > few
          ? (onSeeAll ??
            (() => setWhole((now) => [...now, kind + found.query])))
          : undefined,
    };
  };
  const mine = shown(found.mine, 'mine');
  const saved = shown(found.saved, 'saved');
  const featured = shown(found.featured, 'featured');
  const shared = shown(found.shared, 'shared');
  const readers = shown(found.readers, 'readers');

  return (
    <>
      <SearchSection
        title='Your lists'
        waiting=''
        count={mine.items.length}
        onMore={mine.more}
      >
        {mine.items.map((list, i) => (
          <ListRow
            key={list.id}
            name={list.name}
            detail={counted(found.counts[list.id] ?? 0, 'book')}
            order={i}
            onOpen={() => onOpen(paths.list(list.id))}
          />
        ))}
      </SearchSection>
      <SearchSection
        title='Saved lists'
        waiting=''
        count={saved.items.length}
        onMore={saved.more}
      >
        {saved.items.map((list, i) => {
          const { to, state } = savedOpening(list);
          return (
            <ListRow
              key={`${list.kind}:${list.ref}`}
              name={list.name}
              detail={`${counted(list.books, 'book')} · saved`}
              order={i}
              onOpen={() => onOpen(to, state)}
            />
          );
        })}
      </SearchSection>
      <SearchSection
        title='Featured lists'
        waiting=''
        count={featured.items.length}
        onMore={featured.more}
      >
        {featured.items.map((list, i) => (
          <ListRow
            key={list.id}
            name={list.name}
            detail='Open Library · for every reader'
            order={i}
            onOpen={() => onOpen(paths.featuredList(list.id))}
          />
        ))}
      </SearchSection>
      <SearchSection
        title='Other readers’ lists'
        loading={found.loading.shared}
        waiting='Looking through readers’ lists…'
        count={shared.items.length}
        onMore={shared.more}
      >
        {shared.items.map((list, i) => (
          <ListRow
            key={list.id}
            name={list.name}
            detail={`${list.owner} · ${counted(list.books, 'book')}`}
            order={i}
            onOpen={() => onOpen(paths.sharedList(list.id))}
          />
        ))}
      </SearchSection>
      <SearchSection
        title='Lists on Open Library'
        loading={found.loading.readers}
        waiting='Looking in Open Library…'
        count={readers.items.length}
        onMore={readers.more}
      >
        {readers.items.map((list, i) => (
          <ListRow
            key={`${list.owner}/${list.id}`}
            name={list.name}
            detail={`${counted(list.books, 'book')} · Open Library`}
            order={i}
            onOpen={() => {
              const { to, state } = readersListOpening(list.owner, list.id, {
                name: list.name,
                books: list.books,
              });
              onOpen(to, state);
            }}
          />
        ))}
      </SearchSection>
      {found.readersFailed && !found.looking && (
        <p className='animate-arrive px-3 py-4 text-sm text-muted'>
          Open Library didn’t answer about its lists. Try again in a moment.
        </p>
      )}
    </>
  );
}
