import { catalogueBook } from '@/entities/book/catalogueBook';
import type { ReaderPage } from '@/entities/reader/types';
import { paths } from '@/shared/config/paths';
import { cn } from '@/shared/lib/cn';
import { ListStack, stackClass, stacksClass } from '@/widgets/list-pile';
import { PagePart } from './PagePart';

// A reader's public lists, each a pile on the floor as in Lists, opening
// it: on their own page, the list itself; on another's, as any reader may
// see it
export function ReaderLists({ page }: { page: ReaderPage }) {
  if (!page.lists.length) return null;
  return (
    <PagePart
      title='Lists'
      page={page}
      note={page.you ? 'Only your public lists show here.' : undefined}
    >
      <ul className={stacksClass}>
        {page.lists.map((list, i) => (
          <li
            key={list.ref}
            className={cn('animate-rise', stackClass)}
            style={{ animationDelay: `${Math.min(i, 10) * 50}ms` }}
          >
            <ListStack
              number={i + 1}
              name={list.name}
              to={page.you ? paths.list(list.ref) : paths.sharedList(list.ref)}
              books={list.works.map(catalogueBook)}
              count={list.books}
            />
          </li>
        ))}
      </ul>
    </PagePart>
  );
}
