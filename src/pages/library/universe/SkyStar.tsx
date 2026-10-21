import { memo, type CSSProperties } from 'react';
import { BookCover } from '@/entities/book/ui/BookCover';
import { cn } from '@/shared/lib/cn';
import { Rating } from '@/shared/ui/Rating';
import { raisedClass } from '@/shared/ui/surfaces';
import type { SkyStar as Star } from './layout';

// One book in the sky, at its place, wandering a little. Hovering brings
// it forward with its title (and rating) underneath. `lit`: found by a
// search.
export const SkyStar = memo(function SkyStar({
  star,
  lit,
}: {
  star: Star;
  lit: boolean;
}) {
  const { book, width } = star;
  const author = book.authors.join(', ');
  return (
    <div
      className='star absolute'
      data-star={book.id}
      data-lit={lit || undefined}
      style={
        {
          left: star.x - width / 2,
          top: star.y - width * 0.75,
          width,
          // For the shapes in universe.css, which are cut to the cover's size
          '--w': `${width}px`,
        } as CSSProperties
      }
    >
      <div
        className='sky-drift'
        style={
          {
            '--drift-x': `${star.driftX}px`,
            '--drift-y': `${star.driftY}px`,
            '--drift-time': `${star.driftSeconds}s`,
            '--sway': `${star.sway}deg`,
            '--drift-delay': `${star.phase}s`,
            '--tilt': `${star.tilt}deg`,
          } as CSSProperties
        }
      >
        <div className='star-body'>
          <BookCover
            title={book.title}
            author={author}
            url={book.cover?.url}
            bookId={book.id}
            // The same picture as in the grid and the list
            size='L'
            className='star-cover sky-twinkle'
          />
        </div>
        {/* Clear of the grown cover (it reaches 19% of its width further
            down), on a card of its own, so it reads over whatever covers
            are behind it */}
        <div className='star-caption pointer-events-none absolute left-1/2 top-full mt-[30%] flex w-64 justify-center'>
          <div
            className={cn(
              'max-w-full rounded-2xl px-4 py-2.5 text-center',
              raisedClass,
            )}
          >
            <p className='line-clamp-2 font-serif text-[17px] leading-snug tracking-[-0.01em] text-ink'>
              {book.title}
            </p>
            {author && (
              <p className='mt-1 line-clamp-1 text-[13px] text-ink-soft'>
                {author}
              </p>
            )}
            {book.copy?.rating ? (
              <Rating value={book.copy.rating} className='mt-1 text-[13px]' />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
});
