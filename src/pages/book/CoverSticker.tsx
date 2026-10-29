import { useLayoutEffect, useRef } from 'react';
import { cn } from '@/shared/lib/cn';
import { gsap } from '@/shared/lib/gsap';
import { reducedMotionNow } from '@/shared/lib/motion';

// A band of paper across the cover's top corner, as on a copy in a shop window,
// part of the cover itself (BookCover's children: it flies with it to and from
// the shelves, cut off at its edges): deep ink saying it's in the library,
// plain paper saying it isn't yet. Laid on once the cover's there, sliding in
// from the corner along its slant (GSAP).
export function CoverSticker({ owned }: { owned: boolean }) {
  const band = useRef<HTMLSpanElement>(null);
  useLayoutEffect(() => {
    const el = band.current;
    if (!el || reducedMotionNow()) return;
    const tween = gsap.fromTo(
      el,
      { xPercent: 45, yPercent: -45, opacity: 0 },
      {
        xPercent: 0,
        yPercent: 0,
        opacity: 1,
        duration: 0.7,
        delay: 0.45,
        ease: 'power3.out',
      },
    );
    return () => void tween.kill();
  }, [owned]);

  return (
    // The corner it lies across, cutting it off at the cover's edges
    <span className='pointer-events-none absolute right-0 top-0 aspect-square w-[46%] overflow-hidden'>
      <span ref={band} className='absolute left-[-6%] top-[30%] block w-[150%]'>
        <span
          className={cn(
            'block origin-center rotate-45 py-1.5 text-center text-[9px] font-semibold uppercase tracking-[0.16em] shadow-[0_6px_10px_-6px_rgb(var(--shade)/0.6)] sm:text-[10px]',
            owned ? 'bg-button text-button-text' : 'bg-surface text-ink-soft',
          )}
        >
          {owned ? 'In library' : 'Not added'}
        </span>
      </span>
    </span>
  );
}
