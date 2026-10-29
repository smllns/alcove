import type { AddBookState, Book, CatalogueWork } from '@/entities/book/types';
import { BookCover } from '@/entities/book/ui/BookCover';
import { paths } from '@/shared/config/paths';
import { cn } from '@/shared/lib/cn';
import { MoreToggle } from '@/shared/ui/MoreToggle';
import { TransitionLink } from '@/shared/ui/TransitionLink';
import { useGridFold } from './useGridFold';

// The grid's columns, for the books and for their places while they come
const gridClass =
  'grid grid-cols-3 gap-x-4 gap-y-7 sm:grid-cols-[repeat(auto-fill,7.5rem)] sm:gap-x-6';

// The places of a dozen books while the list's books are on their way:
// covers and their lines, bare
export function WorkGridSkeleton() {
  return (
    <ul aria-hidden className={gridClass}>
      {Array.from({ length: 12 }, (_, i) => (
        <li key={i}>
          <span className='block aspect-[2/3] rounded-md bg-ink/6' />
          <span className='mt-2.5 block h-3.5 w-4/5 rounded bg-ink/6' />
          <span className='mt-1.5 block h-3 w-1/2 rounded bg-ink/4' />
        </li>
      ))}
    </ul>
  );
}

// More books to come than are here, brought only as they're asked for
export type MoreWorks = { onMore: () => void; loading: boolean };

// A book that isn't the catalogue's (in another reader's list, one of
// their own) has no page to open
const fromCatalogue = (work: CatalogueWork) =>
  !work.workKey.startsWith('book-');

// Books from the catalogue as a grid of covers, a few dozen at a time:
// those on the reader's shelves (`owned`, by work) ringed in gold and
// opening their own page, the rest their page from the catalogue. With
// more to come (of those here, then of those still to come), only whole
// rows show, the last only its top half, fading out, and "Show more" opens
// the grid down softly over the next.
export function WorkGrid({
  works,
  owned,
  more,
}: {
  works: CatalogueWork[];
  owned: Map<string, Book>;
  more?: MoreWorks;
}) {
  const { box, count, folded, canLess, showMore, showLess } = useGridFold(
    works.length,
    more?.onMore,
  );
  return (
    <>
      {/* Room round the grid for the covers' rise and rings, inside what's
          cut off */}
      <div
        ref={box}
        data-folded={folded || undefined}
        className='work-grid-fold relative -m-3 overflow-hidden p-3'
      >
        <ul className={gridClass}>
          {works.slice(0, count).map((work, i) => {
            const mine = owned.get(work.workKey)?.id;
            const cover = (
              <>
                <BookCover
                  title={work.title}
                  author={work.authors[0]}
                  url={work.coverUrl}
                  className={cn(
                    'shadow-[0_10px_18px_-10px_rgb(var(--shade)/calc(0.5*var(--shade-k)))] transition-transform duration-500 ease-soft group-hover:-translate-y-1',
                    mine && 'outline-2 outline-offset-2 outline-gold',
                  )}
                />
                <span className='mt-2.5 line-clamp-2 font-serif text-[15px] leading-snug text-ink'>
                  {work.title}
                </span>
                <span className='mt-0.5 block truncate text-xs text-muted'>
                  {mine ? 'On your shelves' : work.authors[0]}
                </span>
              </>
            );
            return (
              <li
                key={work.workKey}
                className='animate-rise'
                style={{ animationDelay: `${Math.min(i % 48, 12) * 40}ms` }}
              >
                {fromCatalogue(work) ? (
                  <TransitionLink
                    to={mine ? paths.book(mine) : paths.work(work.workKey)}
                    state={mine ? undefined : ({ work } satisfies AddBookState)}
                    className='group block'
                  >
                    {cover}
                  </TransitionLink>
                ) : (
                  <div className='block'>{cover}</div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
      {(folded || canLess) && (
        <div className='mt-3 flex justify-center gap-5'>
          {folded && (
            <MoreToggle open={false} onClick={showMore}>
              {more?.loading ? 'Loading…' : 'Show more'}
            </MoreToggle>
          )}
          {canLess && (
            <MoreToggle open onClick={showLess}>
              Show less
            </MoreToggle>
          )}
        </div>
      )}
    </>
  );
}
