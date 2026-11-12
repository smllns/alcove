import type { ReactNode } from 'react';
import { risingCover } from '@/entities/book/coverImage';
import type { AddBookState, Book, CatalogueWork } from '@/entities/book/types';
import { BookCover } from '@/entities/book/ui/BookCover';
import { paths } from '@/shared/config/paths';
import { cn } from '@/shared/lib/cn';
import { MoreToggle } from '@/shared/ui/MoreToggle';
import { TransitionLink } from '@/shared/ui/TransitionLink';
import { CardStars } from './CardStars';
import { useGridFold } from './useGridFold';
import { shelfItem } from './shelfItem';

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

// Books from the catalogue as a grid of covers, a few dozen at a time:
// those on the reader's shelves (`owned`, by work) ringed in gold, with
// the stars they gave them (the rest how readers at large rate them, if
// that's known), and opening their own page, the rest their page from the
// catalogue (one it doesn't know, with what's known of it here). With
// more to come (of those here, then of those still to come), only whole
// rows show, the last only its top half, fading out, and "Show more" opens
// the grid down softly over the next. Elsewhere (another reader's books,
// say), with someone else's `stars` in place of the reader's, a `note`
// under each, and the reader's own not ringed (`ringed`), when they all
// are; or only a few whole `rows`, with `rest` after them (the way to the
// others) if some don't fit.
export function WorkGrid({
  works,
  owned,
  more,
  stars: starsOf,
  note,
  ringed = true,
  rows,
  rest,
}: {
  works: CatalogueWork[];
  owned: Map<string, Book>;
  more?: MoreWorks;
  stars?: (work: CatalogueWork) => number | undefined;
  note?: (work: CatalogueWork) => string | undefined;
  ringed?: boolean;
  rows?: number;
  rest?: ReactNode;
}) {
  const { box, count, folded, canLess, showMore, showLess } = useGridFold(
    works.length,
    more?.onMore,
    rows,
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
            const own = owned.get(work.workKey);
            const mine = own?.id;
            const stars = starsOf ? starsOf(work) : own?.copy?.rating;
            const noted = note?.(work);
            const cover = (
              <>
                <BookCover
                  title={work.title}
                  author={work.authors[0]}
                  url={work.coverUrl}
                  className={cn(
                    risingCover,
                    mine && ringed && 'outline-2 outline-offset-2 outline-gold',
                  )}
                />
                <span className='mt-2.5 line-clamp-2 font-serif text-[0.9375rem] leading-snug text-ink'>
                  {work.title}
                </span>
                <span className='mt-0.5 block truncate text-xs text-muted'>
                  {mine && ringed ? 'On your shelves' : work.authors[0]}
                </span>
                {noted && (
                  <span className='mt-0.5 block truncate text-xs text-faint'>
                    {noted}
                  </span>
                )}
                <CardStars
                  stars={stars}
                  average={work.averageRating}
                  className='mt-1 flex text-xs'
                />
              </>
            );
            // Gliding to its new place as the list's ordered otherwise
            const place = shelfItem(work.workKey, i, { rise: false, step: 0 });
            return (
              <li
                key={work.workKey}
                className={cn('animate-rise', place.className)}
                style={{
                  ...place.style,
                  animationDelay: `${Math.min(i % 48, 12) * 40}ms`,
                }}
              >
                <TransitionLink
                  to={mine ? paths.book(mine) : paths.work(work.workKey)}
                  state={mine ? undefined : ({ work } satisfies AddBookState)}
                  className='group block'
                >
                  {cover}
                </TransitionLink>
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
      {count < works.length && rest}
    </>
  );
}
