import { catalogueBook } from '@/entities/book/catalogueBook';
import { savedOpening } from '@/entities/list/opening';
import type { SavedList } from '@/entities/list/types';
import { cn } from '@/shared/lib/cn';
import { labelClass } from '@/shared/ui/fieldStyles';
import { ListStack, stackClass, stacksClass } from './ListStack';

// Other readers' lists the reader's kept (SaveListButton), each a pile of
// the books it had when kept, numbered on from the reader's own
// (`after`); `className` for each place on the floor, and, sharing a
// floor with them, the column the first stands in
export function SavedStacks({
  saved,
  after,
  className,
  column,
}: {
  saved: SavedList[];
  after: number;
  className?: string;
  column?: number;
}) {
  return saved.map((list, i) => (
    <li
      key={`${list.kind}:${list.ref}`}
      className={cn('animate-rise', stackClass, className)}
      style={{
        animationDelay: `${Math.min(after + i, 10) * 50}ms`,
        gridColumn: column && column + i,
      }}
    >
      <ListStack
        number={after + i + 1}
        name={list.name}
        {...savedOpening(list)}
        books={list.works.map(catalogueBook)}
        count={list.books}
        detail={list.kind === 'shared' ? 'from a reader' : 'Open Library'}
      />
    </li>
  ));
}

// Under the reader's own lists, those they've kept, the last kept first,
// on a floor of their own. With none, nothing.
export function SavedLists({
  saved,
  after,
}: {
  saved: SavedList[];
  after: number;
}) {
  if (!saved.length) return null;
  return (
    <section className='mt-20'>
      <h2 className={labelClass}>Saved lists · {saved.length}</h2>
      <ul className={stacksClass}>
        <SavedStacks saved={saved} after={after} />
      </ul>
    </section>
  );
}
