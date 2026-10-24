import { cn } from '@/shared/lib/cn';
import { clothFor, sizedCover, type CoverSize } from '../coverImage';
import { useCoverPicture } from '../useCoverPicture';

type BookCoverProps = {
  title: string;
  author?: string;
  url?: string;
  size?: CoverSize;
  className?: string;
  // Whose cover it is, so it can fly to the same book's cover on another
  // page (shared/lib/coverFlight)
  bookId?: string;
  // The cover on the book's own page, the one that flies home from it
  home?: boolean;
};

// A cover at a fixed 2:3 shape. Fades in once loaded; books without a
// picture (or whose picture fails) get a plain cloth binding with the title.
export function BookCover({
  title,
  author,
  url,
  size = 'M',
  className,
  bookId,
  home,
}: BookCoverProps) {
  const src = url && sizedCover(url, size);
  const { known, load, picture } = useCoverPicture(src);
  const showPicture = src && load !== 'failed';

  return (
    <div
      data-cover-of={bookId}
      data-cover-home={home || undefined}
      className={cn(
        // book-cover: what flies between the views of the library
        'book-cover @container relative aspect-2/3 overflow-hidden rounded-[3px] bg-line/40',
        className,
      )}
      style={showPicture ? undefined : { backgroundColor: clothFor(title) }}
    >
      {showPicture ? (
        <img
          src={src}
          alt=''
          // One seen already is in the cache: left to load lazily, Safari
          // puts it off until a page turn is over, and the turn shows the
          // cover blank, picture and shadow arriving only after it
          loading={known ? 'eager' : 'lazy'}
          draggable={false}
          {...picture}
          className={cn(
            'size-full object-cover transition-opacity duration-700 ease-soft',
            load === 'loaded' ? 'opacity-100' : 'opacity-0',
          )}
        />
      ) : (
        <div className='flex size-full flex-col justify-between p-[8%] text-[#f3e8d3]'>
          <span className='line-clamp-4 font-serif text-[clamp(0.7rem,7cqw,1.25rem)] leading-tight italic'>
            {title}
          </span>
          {author && (
            <span className='line-clamp-2 text-[clamp(0.5rem,4.5cqw,0.75rem)] uppercase tracking-[0.12em] opacity-75'>
              {author}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
