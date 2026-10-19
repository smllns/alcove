import { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { prefersReducedMotion } from '@/shared/lib/motion';

// Cycles through short lines, each sliding up into place and out again
export function PhraseTicker({ phrases }: { phrases: string[] }) {
  const phraseRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const el = phraseRef.current;
    if (!el || prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ repeat: -1 });
      for (const phrase of phrases) {
        tl.call(() => {
          el.textContent = phrase;
        })
          .fromTo(
            el,
            { y: 8, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.45, ease: 'power2.out' },
          )
          .to(
            el,
            { y: -8, opacity: 0, duration: 0.35, ease: 'power2.in' },
            '+=0.75',
          );
      }
    });

    return () => ctx.revert();
  }, [phrases]);

  return (
    <span className='relative block h-4 overflow-hidden'>
      <span ref={phraseRef} className='block'>
        {phrases[0]}
      </span>
    </span>
  );
}
