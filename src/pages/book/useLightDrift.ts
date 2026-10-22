import { useLayoutEffect, useRef } from 'react';
import { pageScroller } from '@/shared/lib/pageScroll';
import { reducedMotionNow } from '@/shared/lib/motion';

// How much slower than the page the light drifts up, how far it goes at
// most (in screens, so it never leaves an empty paper below it), and how
// far it dims once a screen has been scrolled by
const DRIFT = 0.3;
const FURTHEST = 0.5;
const DIMMED = 0.55;

// A light behind the page (CoverAmbience) following the scroll: drifting
// up a little slower than the page (not at all for those who'd rather
// things kept still) and dimming somewhat once the top is left behind.
// Straight onto the element, frame by frame, rather than re-rendering; the
// first time before the page is first drawn, so it opens already as it'll
// be. Goes by the page's own scroll (PageScroll).
export function useLightDrift<T extends HTMLElement>() {
  const light = useRef<T>(null);
  useLayoutEffect(() => {
    const el = light.current;
    if (!el) return;
    const box = pageScroller(el);
    let frame = 0;
    const place = () => {
      const scrolled = box.scrollTop;
      const passed = Math.min(scrolled / innerHeight, 1);
      el.style.opacity = String(1 - passed * (1 - DIMMED));
      if (!reducedMotionNow())
        el.style.transform = `translateY(${-Math.min(scrolled * DRIFT, innerHeight * FURTHEST)}px)`;
    };
    const follow = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(place);
    };
    place();
    box.addEventListener('scroll', follow, { passive: true });
    return () => {
      box.removeEventListener('scroll', follow);
      cancelAnimationFrame(frame);
    };
  }, []);
  return light;
}
