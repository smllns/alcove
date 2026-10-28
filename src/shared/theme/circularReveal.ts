import { flushSync } from 'react-dom';
import { reducedMotionNow } from '@/shared/lib/motion';
import { setPageTransition } from '@/shared/lib/pageTransition';

// How much of the circle's radius is solid before its soft edge begins
// (handed to the mask in transitions.css as --reveal-solid)
const SOLID = 0.82;

// Runs a DOM update inside a view transition, with the new state growing out
// of `origin` in a circle, its edge soft rather than cut, evenly from start
// to end. Falls back to a plain update where unsupported.
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

  document.documentElement.style.setProperty(
    '--reveal-solid',
    `${SOLID * 100}%`,
  );
  setPageTransition('theme');
  const transition = document.startViewTransition(() => flushSync(update));
  transition.ready
    .then(() => {
      // A square mask centred on the origin, grown till its solid middle
      // covers the farthest corner
      const size = (2 * radius) / SOLID;
      document.documentElement.animate(
        {
          maskSize: ['0px 0px', `${size}px ${size}px`],
          maskPosition: [
            `${x}px ${y}px`,
            `${x - size / 2}px ${y - size / 2}px`,
          ],
        },
        {
          duration: 1200,
          easing: 'cubic-bezier(0.45, 0, 0.2, 1)',
          // Held grown till the transition's done, not back to nothing (and
          // the old palette blinking through) for its last frame
          fill: 'forwards',
          pseudoElement: '::view-transition-new(root)',
        },
      );
    })
    // Given up on by the browser: the new theme simply shows
    .catch(() => {});
}
