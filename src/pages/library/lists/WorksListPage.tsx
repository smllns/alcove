import { booksByWork } from '@/entities/book/booksByWork';
import type { ReactNode } from 'react';
import { catalogueBook } from '@/entities/book/catalogueBook';
import { useBooks } from '@/entities/book/queries';
import type { CatalogueWork } from '@/entities/book/types';
import { useShelf } from '@/entities/book/useShelf';
import { counted } from '@/shared/lib/plural';
import { FormError } from '@/shared/ui/FormError';
import { ListFrame } from './ListFrame';
import { ListLamp } from './ListLamp';
import { ListSearch, NoneFound } from './ListSearch';
import { useListSearch } from './useListSearch';
import { WorkGrid, WorkGridSkeleton, type MoreWorks } from './WorkGrid';

// A list of books from the catalogue opened (one every reader sees,
// another reader's, one made on Open Library): its pile by a measure, how
// many of its books are on the reader's shelves marked in gold, and its
// books' covers, a book in it found by its title or writer. `total`: how
// many it holds, when not all are here yet (`more` brings the next).
// While it's `loading`, drawn bare, its books' places held (ListFrame).
export function WorksListPage({
  lightKey,
  eyebrow,
  name,
  works,
  total = works.length,
  more,
  loading = false,
  error,
  actions,
}: {
  lightKey: string;
  eyebrow: string;
  name: string;
  works: CatalogueWork[];
  total?: number;
  more?: MoreWorks;
  loading?: boolean;
  // Why it didn't load, if it didn't, said in its place
  error?: Error | null;
  // Ways to do something with it (keep it, say), under its pile
  actions?: ReactNode;
}) {
  const owned = booksByWork(useShelf(useBooks(), '', true).all);
  const books = works.map(catalogueBook);
  const mine = works.filter((work) => owned.has(work.workKey)).length;
  const search = useListSearch(works, catalogueBook);

  return (
    <ListFrame
      lightKey={lightKey}
      eyebrow={eyebrow}
      title={name}
      line={`${counted(total, 'book')} · ${mine ? `${mine} in your library` : 'none in your library yet'}`}
      ruler={
        <ListLamp
          books={books}
          marked={(book) => owned.has(book.openLibrary!.work!)}
          label='in your library'
          tone='var(--gold)'
          waiting={loading}
          total={total}
        />
      }
      search={<ListSearch search={search} books={books} className='w-full' />}
      waiting={
        error && (
          <FormError message={`This list didn’t load. ${error.message}`} />
        )
      }
      loading={loading}
      actions={actions}
    >
      {loading ? (
        <WorkGridSkeleton />
      ) : search.found.length ? (
        <WorkGrid
          works={search.found}
          owned={owned}
          more={search.asked ? undefined : more}
        />
      ) : (
        <NoneFound />
      )}
    </ListFrame>
  );
}
