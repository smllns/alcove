import { useState } from 'react';
import { cn } from '@/shared/lib/cn';
import { clothFor, sizedCover, type CoverSize } from '../coverImage';

type BookCoverProps = {
  title: string;
  author?: string;
  url?: string;
  size?: CoverSize;
  className?: string;
};

// A cover at a fixed 2:3 shape. Fades in once loaded; books without a
// picture (or whose picture fails) get a plain cloth binding with the title.
export function BookCover({
  title,
  author,
  url,
  size = 'M',
  className,
}: BookCoverProps) {
  const [state, setState] = useState<'loading' | 'loaded' | 'failed'>(
    url ? 'loading' : 'failed',
  );
  const showPicture = url && state !== 'failed';

  return (
    <div
      className={cn(
        '@container relative aspect-2/3 overflow-hidden rounded-[3px] bg-line/40',
        className,
      )}
      style={showPicture ? undefined : { backgroundColor: clothFor(title) }}
    >
      {showPicture ? (
        <img
          src={sizedCover(url, size)}
          alt=''
          loading='lazy'
          decoding='async'
          draggable={false}
          onLoad={(e) => {
            // Open Library answers a missing cover with a 1×1 pixel
            setState(e.currentTarget.naturalWidth > 1 ? 'loaded' : 'failed');
          }}
          onError={() => setState('failed')}
          className={cn(
            'size-full object-cover transition-opacity duration-700 ease-soft',
            state === 'loaded' ? 'opacity-100' : 'opacity-0',
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
