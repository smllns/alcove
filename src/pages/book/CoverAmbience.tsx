import { useState } from 'react';
import {
  clothFor,
  coverSeen,
  sizedCover,
  type CoverSize,
} from '@/entities/book/coverImage';
import type { Book } from '@/entities/book/types';
import { useCoverPicture } from '@/entities/book/useCoverPicture';
import { cn } from '@/shared/lib/cn';
import { useLightDrift } from './useLightDrift';

const sizes: CoverSize[] = ['L', 'M', 'S'];

// The book's own colours, washed behind its page: its cover, blurred far
// past recognition and faded into the paper, so every book's page takes on
// a light of its own. It stays behind the page all the way down, drifting
// and dimming as it scrolls (useLightDrift). A book without a picture (or
// whose picture is missing) glows in its cloth. Its cover seen already (on
// the shelves, say), the light is there from the first frame, so it comes
// and goes with the page rather than after it.
export function CoverAmbience({ book }: { book: Book }) {
  const url = book.cover?.url;
  // Blurred this far, any size will do: whichever was seen already (the
  // shelves and the sky show it large, a list small), or the large one the
  // page itself shows
  const [src] = useState(
    () =>
      url &&
      (sizes.map((size) => sizedCover(url, size)).find(coverSeen) ??
        sizedCover(url, 'L')),
  );
  const { known, load, picture } = useCoverPicture(src);
  const light = useLightDrift<HTMLDivElement>();

  return (
    <div
      aria-hidden
      className='pointer-events-none fixed inset-0 -z-10 overflow-hidden'
    >
      <div ref={light} className='absolute inset-x-0 top-[-10%] h-[180%]'>
        {src && load !== 'failed' ? (
          <img
            src={src}
            alt=''
            {...picture}
            className={cn(
              'absolute left-1/2 top-[-15%] h-[130%] w-[130%] max-w-none -translate-x-1/2 object-cover blur-[90px] saturate-150 dark:saturate-[1.6] dark:brightness-110',
              // Only one coming in late fades in, evenly, not all at once
              !known && 'transition-opacity duration-[1.5s] ease-in-out',
              load === 'loaded' ? 'opacity-30' : 'opacity-0',
            )}
          />
        ) : (
          <div
            className='absolute inset-0 opacity-30'
            style={{
              background: `radial-gradient(ellipse at 30% 20%, ${clothFor(book.title)}, transparent 70%)`,
            }}
          />
        )}
      </div>
      {/* Strongest at the top, never quite gone further down: the paper
          laid back over it, more of it lower down. Not a mask, which
          Safari leaves out of the picture it takes of the page as it
          turns to the next, so the light blinks off */}
      <div
        className='absolute inset-0'
        style={{
          background:
            'linear-gradient(to bottom, transparent 25%, color-mix(in oklab, var(--bg-mid) 45%, transparent) 75%, color-mix(in oklab, var(--bg-mid) 65%, transparent))',
        }}
      />
    </div>
  );
}
