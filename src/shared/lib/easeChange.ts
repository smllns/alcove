import { flushSync } from 'react-dom';
import { reducedMotionNow } from './motion';
import { setPageTransition } from './pageTransition';

// Runs a DOM update as a 'shelf' view transition (styled in
// styles/transitions.css): what stays glides to where it now belongs, what
// goes fades out, what's new fades in. A plain update where unsupported.
export function easeChange(update: () => void) {
  if (!document.startViewTransition || reducedMotionNow()) {
    update();
    return;
  }
  setPageTransition('shelf');
  document.startViewTransition(() => flushSync(update));
}
