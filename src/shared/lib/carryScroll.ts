import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router';

// A page changing without the window scrolling mid-transition (Safari
// draws the old page out of place for a frame if it does, which flashes).
// Going forward from a page scrolled down, to a new one that opens at its
// top, the window stays where it is and the new page is let down by as
// much, so its top is what's in view. Going back to a page left scrolled
// to elsewhere, the window stays where it is too, and the page is lifted
// or let down by the difference, so it shows as it was left. Once the
// transition is over, the two are undone together, which shows no change.

// How far down the page was left, while it's being carried over
let carried = 0;
// How far down the page being gone back from was, as going back begins
let leaving: number | null = null;
// How far the new page is let down meanwhile (lifted, if less than none)
let letDown = 0;

// Before going forward: whether there's a scroll to carry over (the
// navigation then mustn't reset it itself: preventScrollReset)
export function carryScroll() {
  carried = Math.round(scrollY);
  return carried > 0;
}

// As going back begins (popstate, before the router hears of it)
export function holdScrollForReturn() {
  leaving = Math.round(scrollY);
}

// Whether the page that's just opened is being carried, so isn't to be
// sent to its top just yet
export const scrollCarried = () => carried > 0;

// How far down the page itself is scrolled: the window's own scroll, less
// what's carried over (for what follows the scroll, like a book's light,
// so it doesn't take a page just opened for one scrolled down)
export const pageScrollY = () => scrollY - letDown;

// Once the transition's animations are all done, or soon anyway
function afterTransition(done: () => void) {
  const began = performance.now();
  const check = () => {
    const moving = document
      .getAnimations()
      .some(
        (a) =>
          a.effect instanceof KeyframeEffect &&
          a.effect.pseudoElement?.startsWith('::view-transition'),
      );
    if (moving && performance.now() - began < 2500)
      requestAnimationFrame(check);
    else done();
  };
  // A frame first, for the transition to have started
  requestAnimationFrame(() => requestAnimationFrame(check));
}

// The page shown `by` lower than the window's scroll says (higher, if
// less than none), or just where it is
function shiftPage(root: HTMLElement, by: number) {
  root.style.paddingTop = by > 0 ? `${by}px` : '';
  root.style.marginTop = by < 0 ? `${by}px` : '';
  letDown = by;
}

// The window held `at` a scroll while the page shows as it would `shown`
// one, until the transition is over; then the window scrolls to it for
// real as the page is put back, which shows no change (nor undoes any
// scrolling meanwhile). The room first, so a page that's no taller than
// the screen (the sky) has somewhere to be held at; then, wherever the
// window really got to, the page shown from there.
function hold(at: number, shown: number, done?: () => void) {
  const root = document.getElementById('root');
  if (!root) return;
  shiftPage(root, at - shown);
  window.scrollTo({ top: at, behavior: 'instant' });
  shiftPage(root, Math.round(scrollY) - shown);
  afterTransition(() => {
    done?.();
    const by = letDown;
    shiftPage(root, 0);
    window.scrollTo({ top: scrollY - by, behavior: 'instant' });
  });
}

// In the layout around every page, ahead of the page itself: lets the new
// page down as it opens, and takes it back up to the top, out of sight,
// once it's in. Ahead, so it's done before the new page's own first look
// at itself, which would have the browser cut the scroll down to the
// short page it would otherwise be for a moment.
export function CarriedScroll() {
  const { key } = useLocation();
  useLayoutEffect(() => {
    if (carried) hold(carried, 0, () => (carried = 0));
  }, [key]);
  return null;
}

// In the layout around every page, after ScrollRestoration: going back,
// holds the window where it was, the page returned to shown as far down
// as the router has just put it all the same
export function ReturnedScroll() {
  const { key } = useLocation();
  useLayoutEffect(() => {
    if (leaving === null) return;
    const from = leaving;
    leaving = null;
    const to = Math.round(scrollY);
    if (to !== from) hold(from, to);
  }, [key]);
  return null;
}
