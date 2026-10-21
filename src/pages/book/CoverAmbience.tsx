import { useEffect, useRef, useState } from 'react';
import { clothFor, sizedCover } from '@/entities/book/coverImage';
import type { Book } from '@/entities/book/types';
import { cn } from '@/shared/lib/cn';
import { reducedMotionNow } from '@/shared/lib/motion';

// How much slower than the page the light drifts up, how far it goes at
// most (in screens, so it never leaves an empty paper below it), and how
// far it dims once a screen has been scrolled by
const DRIFT = 0.3;
const FURTHEST = 0.5;
const DIMMED = 0.55;

// The book's own colours, washed behind its page: its cover, blurred far
// past recognition and faded into the paper, so every book's page takes on
// a light of its own. It stays behind the page all the way down, drifting
// a little slower than the page (and not at all for those who'd rather
// things kept still), dimming somewhat once the top is left behind so the
// reading stays easy. A book without a picture glows in its cloth.
export function CoverAmbience({ book }: { book: Book }) {
  const [loaded, setLoaded] = useState(false);
  const light = useRef<HTMLDivElement>(null);
  const url = book.cover?.url;

  // Straight onto the element, frame by frame, rather than re-rendering
  useEffect(() => {
    const el = light.current;
    if (!el) return;
    let frame = 0;
    const follow = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const passed = Math.min(scrollY / innerHeight, 1);
        el.style.opacity = String(1 - passed * (1 - DIMMED));
        if (!reducedMotionNow())
          el.style.transform = `translateY(${-Math.min(scrollY * DRIFT, innerHeight * FURTHEST)}px)`;
      });
    };
    follow();
    addEventListener('scroll', follow, { passive: true });
    return () => {
      removeEventListener('scroll', follow);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      aria-hidden
      className='pointer-events-none fixed inset-0 -z-10 overflow-hidden'
      // Strongest at the top, never quite gone further down
      style={{
        maskImage:
          'linear-gradient(to bottom, black 25%, rgb(0 0 0 / 0.55) 75%, rgb(0 0 0 / 0.35))',
      }}
    >
      <div ref={light} className='absolute inset-x-0 top-[-10%] h-[180%]'>
        {url ? (
          <img
            src={sizedCover(url, 'M')}
            alt=''
            onLoad={() => setLoaded(true)}
            className={cn(
              'absolute left-1/2 top-[-15%] h-[130%] w-[130%] max-w-none -translate-x-1/2 object-cover blur-[90px] saturate-150 transition-opacity duration-[1.5s] ease-soft dark:saturate-[1.6] dark:brightness-110',
              loaded ? 'opacity-30' : 'opacity-0',
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
    </div>
  );
}
