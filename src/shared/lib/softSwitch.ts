import { flushSync } from 'react-dom';
import { reducedMotionNow } from './motion';
import { setPageTransition } from './pageTransition';

// Changes what a part of the page shows (`.soft-switch`, styles in
// transitions.css) softly: the old fades away as the new comes in, and the
// part grows or shrinks to fit, rather than everything jumping at once.
// Plainly, where the browser can't or the reader would rather not.
// `settle`: anything to put right once the change is on the page, before
// it's shown, e.g. where the page is scrolled to
export function softSwitch(change: () => void, settle?: () => void) {
  const changed = () => {
    flushSync(change);
    settle?.();
  };
  if (!document.startViewTransition || reducedMotionNow()) {
    changed();
    return;
  }
  setPageTransition('switch');
  document.startViewTransition(changed);
}

// Over to `top` of the page first, then the change, so it's seen
export function softSwitchAt(
  top: number,
  change: () => void,
  settle?: () => void,
) {
  if (Math.abs(scrollY - top) < 4 || reducedMotionNow()) {
    window.scrollTo(0, top);
    softSwitch(change, settle);
    return;
  }
  window.scrollTo({ top, behavior: 'smooth' });
  // The change comes the moment the page gets there, or stops short of it
  // (at its end): watched frame by frame, as not every browser says when a
  // scroll ends, and waiting it out would leave the page sitting still
  const began = performance.now();
  let last = scrollY;
  let still = 0;
  const watch = () => {
    still = scrollY === last ? still + 1 : 0;
    last = scrollY;
    const arrived = Math.abs(scrollY - top) < 2 || still >= 3;
    if (arrived || performance.now() - began > 1000) softSwitch(change, settle);
    else requestAnimationFrame(watch);
  };
  requestAnimationFrame(watch);
}
