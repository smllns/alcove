import {
  useWorkFeatured,
  useWorkLists,
} from '@/entities/book/catalogueListQueries';
import type { Book } from '@/entities/book/types';
import { useLists } from '@/entities/list/queries';
import { ListCard } from '@/entities/list/ui/ListCard';
import { paths } from '@/shared/config/paths';
import { cn } from '@/shared/lib/cn';
import { Collapse } from '@/shared/ui/Collapse';
import { TransitionLink } from '@/shared/ui/TransitionLink';
import { readersListOpening } from '@/entities/list/opening';
import { Arriving } from './Arriving';
import { BookSection } from './BookSection';
import { Labelled } from './Labelled';

// Columns as wide as the room, not as a long name, which is cut short
// instead
const gridClass = 'grid grid-cols-1 gap-3 sm:grid-cols-2';
// A list's card, opening its list, lifting a touch as it's pointed at
const cardLinkClass =
  'block transition-transform duration-500 ease-soft hover:-translate-y-0.5';

// The lists the book is in: the reader's own (whether their copy's in it,
// or the catalogue's book); and on Open Library, the lists every reader
// sees and the most popular of those readers have made whose books can be
// shown here, opening out softly once found. Each opens its list. With
// none, no section.
export function BookLists({ book }: { book: Book }) {
  const lists = useLists().data;
  // Those it's in as the reader's copy, or as the catalogue's book
  const work = book.openLibrary?.work;
  const ours = (lists?.lists ?? []).filter(
    (list) =>
      book.lists?.includes(list.id) ||
      (work && list.works?.some((each) => each.workKey === work)),
  );
  // The lists every reader sees, and the most popular few readers have
  // made, as the server picks them
  const featured = useWorkFeatured(work).data ?? [];
  const theirs = useWorkLists(work).data?.lists ?? [];
  const elsewhere = featured.length + theirs.length > 0;

  return (
    <Arriving ready={ours.length > 0 || elsewhere}>
      <BookSection title='Lists'>
        <div>
          {ours.length > 0 && (
            <Labelled label='Yours'>
              <ul className={gridClass}>
                {ours.map((list) => (
                  <li key={list.id}>
                    <TransitionLink
                      to={paths.list(list.id)}
                      className={cardLinkClass}
                    >
                      <ListCard
                        name={list.name}
                        books={lists?.counts[list.id] ?? 1}
                        whose='Open list'
                      />
                    </TransitionLink>
                  </li>
                ))}
              </ul>
            </Labelled>
          )}
          {/* Found after the page opens, so it makes its room softly, the
              room between it and the reader's own lists with it: none is
              left under theirs while there's nothing to come */}
          <Collapse open={elsewhere} arriving>
            <Labelled
              label='On Open Library'
              className={cn(ours.length > 0 && 'pt-7')}
            >
              <ul className={gridClass}>
                {featured.map((list) => (
                  <li key={list.id}>
                    <TransitionLink
                      to={paths.featuredList(list.id)}
                      className={cardLinkClass}
                    >
                      <ListCard
                        name={list.name}
                        books={list.books}
                        whose='Open list'
                      />
                    </TransitionLink>
                  </li>
                ))}
                {theirs.map((list) => (
                  <li key={`${list.owner}/${list.id}`}>
                    <TransitionLink
                      {...readersListOpening(list.owner, list.id, {
                        name: list.name,
                        books: list.books,
                      })}
                      className={cardLinkClass}
                    >
                      <ListCard
                        name={list.name}
                        books={list.books}
                        whose='Open list'
                      />
                    </TransitionLink>
                  </li>
                ))}
              </ul>
            </Labelled>
          </Collapse>
        </div>
      </BookSection>
    </Arriving>
  );
}
