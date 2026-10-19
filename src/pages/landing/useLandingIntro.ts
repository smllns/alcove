import { useEffect, useRef, type RefObject } from 'react';
import { gsap } from 'gsap';

// Slow, staggered entrance for the page chrome and hero. Built paused on mount,
// so everything waits hidden behind the preloader, and plays once `play` is true.
// With `skip` (a return visit) there's no entrance: the page is just there.
export function useLandingIntro(
  scope: RefObject<HTMLElement | null>,
  play: boolean,
  skip = false,
) {
  const intro = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    if (!scope.current || skip) return;

    const ctx = gsap.context(() => {
      intro.current = gsap
        .timeline({ paused: true, defaults: { ease: 'power3.out' } })
        .from('.site-header', { y: -18, opacity: 0, duration: 1.4 }, 0.3)
        .from(
          '.hero-halo',
          { opacity: 0, scale: 0.9, duration: 2, ease: 'power2.out' },
          0.5,
        )
        .from('.hero-eyebrow', { y: 14, opacity: 0, duration: 1.3 }, 0.7)
        .from('.hero-title', { y: 40, opacity: 0, duration: 1.8 }, 0.85)
        .from('.hero-description', { y: 20, opacity: 0, duration: 1.4 }, 1.3)
        .from('.hero-actions', { y: 16, opacity: 0, duration: 1.4 }, 1.6)
        .from(
          '.site-footer',
          { opacity: 0, duration: 1.6, ease: 'power2.out' },
          2,
        );
    }, scope);

    return () => ctx.revert();
  }, [scope, skip]);

  useEffect(() => {
    if (play) intro.current?.play();
  }, [play]);
}
