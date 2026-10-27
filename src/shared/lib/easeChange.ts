import { flushSync } from 'react-dom';
import { reducedMotionNow } from './motion';
import { setPageTransition, type PageTransition } from './pageTransition';

let easing = false;

// Whether a change is easing in right now
export const isEasing = () => easing;

// Runs a DOM update as a view transition of the given kind (styled in
// styles/transitions.css, swap in styles/places.css): what stays glides to where it now belongs, what
// goes fades out, what's new fades in. A plain update where unsupported.
export function easeChange(
  update: () => void,
  kind: Extract<PageTransition, 'shelf' | 'view' | 'swap'> = 'shelf',
) {
  if (!document.startViewTransition || reducedMotionNow()) {
    update();
    return;
  }
  setPageTransition(kind);
  easing = true;
  const transition = document.startViewTransition(() => flushSync(update));
  void transition.finished
    .catch(() => {})
    .finally(() => {
      easing = false;
    });
}
