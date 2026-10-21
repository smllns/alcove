import { flushSync } from 'react-dom';
import { reducedMotionNow } from '@/shared/lib/motion';
import { setPageTransition } from '@/shared/lib/pageTransition';

// Runs a DOM update inside a view transition, with the new state growing out
// of `origin` in a circle. Falls back to a plain update where unsupported.
export function circularReveal(origin: HTMLElement, update: () => void) {
  if (!document.startViewTransition || reducedMotionNow()) {
    update();
    return;
  }

  const { left, top, width, height } = origin.getBoundingClientRect();
  const x = left + width / 2;
  const y = top + height / 2;
  const radius = Math.hypot(
    Math.max(x, innerWidth - x),
    Math.max(y, innerHeight - y),
  );

  setPageTransition('theme');
  const transition = document.startViewTransition(() => flushSync(update));
  transition.ready
    .then(() => {
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${radius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: 900,
          easing: 'cubic-bezier(0.65, 0, 0.35, 1)',
          pseudoElement: '::view-transition-new(root)',
        },
      );
    })
    // Given up on by the browser: the new theme simply shows
    .catch(() => {});
}
