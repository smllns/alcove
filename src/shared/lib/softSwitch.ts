import { flushSync } from 'react-dom';
import { reducedMotionNow } from './motion';
import { setPageTransition } from './pageTransition';

// Changes what a part of the page shows (`.soft-switch`, styles in
// transitions.css) softly: the old fades away as the new comes in, and the
// part grows or shrinks to fit, rather than everything jumping at once.
// Plainly, where the browser can't or the reader would rather not.
export function softSwitch(change: () => void) {
  if (!document.startViewTransition || reducedMotionNow()) {
    change();
    return;
  }
  setPageTransition('switch');
  document.startViewTransition(() => flushSync(change));
}

// Back up to the top of the page first, then the change, so it's seen
export function softSwitchFromTop(change: () => void) {
  if (scrollY < 4 || reducedMotionNow()) {
    window.scrollTo(0, 0);
    softSwitch(change);
    return;
  }
  let done = false;
  const go = () => {
    if (done) return;
    done = true;
    softSwitch(change);
  };
  window.addEventListener('scrollend', go, { once: true });
  // Not every browser says when a scroll ends
  window.setTimeout(go, 700);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
