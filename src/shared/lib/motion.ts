const reducedMotionQuery = '(prefers-reduced-motion: reduce)';

// Read once at startup; for decisions made at module or mount time
export const prefersReducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia(reducedMotionQuery).matches;

// Read live; for decisions made in response to a click
export const reducedMotionNow = () =>
  window.matchMedia(reducedMotionQuery).matches;

export const wait = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// Back up to the top of the page: gliding there, unless motion is reduced
export const scrollToTop = () =>
  window.scrollTo({
    top: 0,
    behavior: reducedMotionNow() ? 'auto' : 'smooth',
  });
