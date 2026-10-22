import { reducedMotionNow } from './motion';

// How far down the screen what folds back is brought, at most, when it
// would otherwise close up out of sight above
const IN_VIEW = 0.2;

// Something on the page folding open or back (a long text, a list), frame
// by frame: `frame` is given how far along it is, eased. The page holds
// still meanwhile: what's above stays put, what's below simply follows,
// with the browser's scroll anchoring held off so it doesn't scroll the
// page after what's below. Only when where it folds back to (`at`'s top)
// is above the screen does the page go up along with it, in the same
// frames, so it closes up in view rather than out of sight above. A wheel
// or touch from the reader leaves the page to them. Returns a stop.
export function foldMotion({
  at,
  closing,
  ms,
  ease,
  frame,
  done,
}: {
  at: Element | null;
  closing: boolean;
  ms: number;
  ease: (t: number) => number;
  frame?: (p: number) => void;
  done?: () => void;
}) {
  const root = document.documentElement;
  const anchoring = root.style.overflowAnchor;
  root.style.overflowAnchor = 'none';

  const startY = scrollY;
  const top = at?.getBoundingClientRect().top ?? 0;
  const limit = innerHeight * IN_VIEW;
  let rise = closing && at && top < limit ? top - limit : 0;
  const leave = () => (rise = 0);
  addEventListener('wheel', leave, { passive: true });
  addEventListener('touchstart', leave, { passive: true });

  const length = reducedMotionNow() ? 0 : ms;
  const began = performance.now();
  let id = 0;
  const stop = () => {
    cancelAnimationFrame(id);
    removeEventListener('wheel', leave);
    removeEventListener('touchstart', leave);
    root.style.overflowAnchor = anchoring;
  };
  const step = (now: number) => {
    const t = length ? Math.min(1, Math.max(0, (now - began) / length)) : 1;
    const p = ease(t);
    frame?.(p);
    if (rise) window.scrollTo({ top: startY + rise * p, behavior: 'instant' });
    if (t < 1) id = requestAnimationFrame(step);
    else {
      stop();
      done?.();
    }
  };
  id = requestAnimationFrame(step);
  return stop;
}
