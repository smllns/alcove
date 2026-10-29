import { catalogueBook } from '@/entities/book/catalogueBook';
import {
  useFeaturedList,
  useFeaturedLists,
} from '@/entities/book/catalogueListQueries';
import type { Book, FeaturedList } from '@/entities/book/types';
import { cn } from '@/shared/lib/cn';
import { paths } from '@/shared/config/paths';
import { labelClass } from '@/shared/ui/fieldStyles';
import { ListStack, stackClass, stacksClass } from './ListStack';

// Under the reader's own lists, those every reader sees, from Open
// Library: what's read most this week, and the classics. Each pile comes
// in as its books do, a spinner on its floor till then; how many of each
// the reader has is told under it.
export function FeaturedLists({
  owned,
  after,
}: {
  owned: Map<string, Book>;
  // How many lists of the reader's come before, to number on from
  after: number;
}) {
  const lists = useFeaturedLists().data ?? [];
  if (!lists.length) return null;
  return (
    <section className='mt-20'>
      <h2 className={labelClass}>From Open Library</h2>
      <ul className={stacksClass}>
        {lists.map((list, i) => (
          <li
            key={list.id}
            className={cn('animate-rise', stackClass)}
            style={{ animationDelay: `${Math.min(i, 10) * 50}ms` }}
          >
            <FeaturedStack list={list} number={after + i + 1} owned={owned} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function FeaturedStack({
  list,
  number,
  owned,
}: {
  list: FeaturedList;
  number: number;
  owned: Map<string, Book>;
}) {
  const works = useFeaturedList(list.id).data?.works;
  return (
    <ListStack
      number={number}
      name={list.name}
      to={paths.featuredList(list.id)}
      books={works?.map(catalogueBook)}
      count={works?.length ?? 0}
      owned={works?.filter((work) => owned.has(work.workKey)).length ?? 0}
    />
  );
}
