import { useWorkLists } from '@/entities/book/catalogueQueries';
import type { Book } from '@/entities/book/types';
import { useLists } from '@/entities/list/queries';
import { ListCard } from '@/entities/list/ui/ListCard';
import { cn } from '@/shared/lib/cn';
import { Collapse } from '@/shared/ui/Collapse';
import { Arriving } from './Arriving';
import { BookSection } from './BookSection';
import { Labelled } from './Labelled';

// Columns as wide as the room, not as a long name, which is cut short
// instead
const gridClass = 'grid grid-cols-1 gap-3 sm:grid-cols-2';

// The lists the book is in: the reader's own (changed with the rest of
// the copy, in the edit), and the most popular of those readers have made
// on Open Library, opening out softly once found. With neither, no
// section.
export function BookLists({ book }: { book: Book }) {
  const lists = useLists().data;
  const ours = (lists?.lists ?? []).filter((list) =>
    book.lists?.includes(list.id),
  );
  // The most popular few, as the server picks them
  const theirs = useWorkLists(book.openLibrary?.work).data?.lists ?? [];

  return (
    <Arriving ready={ours.length > 0 || theirs.length > 0}>
      <BookSection title='Lists'>
        <div>
          {ours.length > 0 && (
            <Labelled label='Yours'>
              <ul className={gridClass}>
                {ours.map((list) => (
                  <li key={list.id}>
                    <ListCard
                      name={list.name}
                      books={lists?.counts[list.id] ?? 1}
                      whose='Yours'
                    />
                  </li>
                ))}
              </ul>
            </Labelled>
          )}
          {/* Found after the page opens, so it makes its room softly, the
              room between it and the reader's own lists with it: none is
              left under theirs while there's nothing to come */}
          <Collapse open={theirs.length > 0} arriving>
            <Labelled
              label='Popular on Open Library'
              className={cn(ours.length > 0 && 'pt-7')}
            >
              <ul className={gridClass}>
                {theirs.map((list) => (
                  <li key={list.url}>
                    <ListCard
                      name={list.name}
                      books={list.books}
                      whose='Open Library'
                    />
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
