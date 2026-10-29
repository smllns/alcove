import { booksByWork } from '@/entities/book/booksByWork';
import { Plus } from 'lucide-react';
import type { Shelf } from '@/entities/book/useShelf';
import { useLists, useSavedLists } from '@/entities/list/queries';
import { cn } from '@/shared/lib/cn';
import { paths } from '@/shared/config/paths';
import { useMediaQuery } from '@/shared/lib/useMediaQuery';
import { useTransitionNavigate } from '@/shared/lib/useTransitionNavigate';
import { labelClass } from '@/shared/ui/fieldStyles';
import { Button } from '@/shared/ui/Button';
import { FormError } from '@/shared/ui/FormError';
import { Loading } from '@/shared/ui/Loading';
import { FeaturedLists } from './FeaturedLists';
import { FirstList } from './FirstList';
import { SavedLists, SavedStacks } from './SavedLists';
import { isOwn, listedBooks } from './listedBooks';
import { ListsFinder } from './ListsFinder';
import { ListStack, stackClass, stacksClass } from './ListStack';

// A floor of four, for the reader's few lists and their few kept ones
const togetherClass = 'grid grid-cols-4 gap-x-8 pt-4';

// Every list of the reader's, each a pile of its books standing on the
// floor, piles carrying over onto the next floor down as there are more,
// a way to find one (theirs, other readers', Open Library's), and a way
// to start another, its page opened to fill (while there are
// none, the place of the first: FirstList)
export function ListsSection({ shelf }: { shelf: Shelf }) {
  const lists = useLists();
  const saved = useSavedLists().data ?? [];
  const wide = useMediaQuery('(min-width: 1024px)');
  const navigate = useTransitionNavigate();
  const start = () => void navigate(paths.newList);
  if (lists.isPending) return <Loading />;
  if (lists.isError)
    return (
      <FormError
        message={`Your lists didn’t load. ${lists.error.message}`}
        className='py-10 text-center'
      />
    );

  const { lists: all, counts } = lists.data;
  // Few of their own and few kept, on a wide screen: all on the one floor,
  // the kept ones under a word of their own
  const together =
    wide &&
    all.length > 0 &&
    saved.length > 0 &&
    all.length + saved.length <= 4;
  return (
    <section className='mx-auto w-full max-w-6xl'>
      {/* On a phone, the search a row of its own under the rest, as wide
          as the page, for what it finds to have the room */}
      <div className='mb-2 flex flex-wrap items-center gap-x-2.5 gap-y-4'>
        {/* All on one floor, each part's word stands over its own */}
        <h2 className={cn(labelClass, 'mr-auto', together && 'invisible')}>
          Your lists · {all.length}
        </h2>
        <ListsFinder className='max-sm:order-last max-sm:w-full sm:w-64' />
        <Button variant='pill' onClick={start} className='shrink-0'>
          <Plus size={15} />
          New list
        </Button>
      </div>
      {all.length ? (
        <ul className={together ? togetherClass : stacksClass}>
          {all.map((list, i) => {
            const books = listedBooks(list, shelf.all);
            return (
              <li
                key={list.id}
                className={cn(
                  'animate-rise',
                  stackClass,
                  together && 'row-start-2',
                )}
                style={{
                  animationDelay: `${Math.min(i, 10) * 50}ms`,
                  gridColumn: together ? i + 1 : undefined,
                }}
              >
                <ListStack
                  number={i + 1}
                  name={list.name}
                  to={paths.list(list.id)}
                  books={books}
                  count={counts[list.id] ?? books.length}
                  owned={books.filter(isOwn).length}
                />
              </li>
            );
          })}
          {together && (
            <>
              <li
                className='row-start-1 pb-4'
                style={{ gridColumn: `1 / span ${all.length}` }}
              >
                <h2 className={labelClass}>Your lists · {all.length}</h2>
              </li>
              <li
                className='row-start-1 pb-4'
                style={{
                  gridColumn: `${all.length + 1} / span ${saved.length}`,
                }}
              >
                <h2 className={labelClass}>Saved lists · {saved.length}</h2>
              </li>
              {/* A wall between the two, as between rooms in a section */}
              <li
                aria-hidden
                className='pointer-events-none -ml-4 w-0 border-l border-line'
                style={{ gridColumn: all.length + 1, gridRow: '1 / span 4' }}
              />
              <SavedStacks
                saved={saved}
                after={all.length}
                className='row-start-2'
                column={all.length + 1}
              />
            </>
          )}
        </ul>
      ) : (
        <FirstList onStart={start} />
      )}
      {!together && <SavedLists saved={saved} after={all.length} />}
      <FeaturedLists
        owned={booksByWork(shelf.all)}
        after={all.length + saved.length}
      />
    </section>
  );
}
