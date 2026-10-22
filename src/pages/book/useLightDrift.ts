import { useLayoutEffect, useRef } from 'react';
import { pageScrollY } from '@/shared/lib/carryScroll';
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
// be. Goes by how far the page itself is scrolled (carryScroll), so a
// page just opened from one scrolled down isn't taken for one itself.
export function useLightDrift<T extends HTMLElement>() {
  const light = useRef<T>(null);
  useLayoutEffect(() => {
    const el = light.current;
    if (!el) return;
    let frame = 0;
    const place = () => {
      const scrolled = pageScrollY();
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
    addEventListener('scroll', follow, { passive: true });
    return () => {
      removeEventListener('scroll', follow);
      cancelAnimationFrame(frame);
    };
  }, []);
  return light;
}
