import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router';

// A page changing without the window scrolling at all until the
// transition is over: Safari draws the old page out of place for a frame
// if it does, which flashes, and on an iPhone, where scrolling can show or
// hide the browser's bars and so resize the screen, may drop the
// transition altogether. Going forward from a page scrolled down, to a
// new one that opens at its top, the window stays where it is and the new
// page is let down by as much, so its top is what's in view. Going back
// to a page left scrolled to elsewhere, the router's own scroll there is
// held back; the window stays where it is again, and the page is lifted
// or let down by the difference, so it shows as it was left. Once the
// transition is over, the two are undone together, which shows no change.

// How far down the page was left, while it's being carried over
let carried = 0;
// Going back: how far down the page being left was, and where the router
// would have had the window go for the page returned to
let leaving: number | null = null;
let wanted: number | null = null;
// Lets the router scroll the window again
let unhold: (() => void) | null = null;
// How far the new page is let down meanwhile (lifted, if less than none)
let letDown = 0;

// Before going forward: whether there's a scroll to carry over (the
// navigation then mustn't reset it itself: preventScrollReset)
export function carryScroll() {
  carried = scrollY;
  return carried > 0;
}

// As going back begins (popstate, before the router hears of it): the
// router's scroll to where the page returned to was left is only noted
export function holdScrollForReturn() {
  unhold?.();
  leaving = scrollY;
  wanted = null;
  const own = window.scrollTo;
  const note = ((a?: ScrollToOptions | number, b?: number) => {
    wanted = typeof a === 'object' ? (a.top ?? 0) : (b ?? 0);
  }) as typeof window.scrollTo;
  window.scrollTo = note;
  // Should the page not change after all
  const timer = window.setTimeout(() => unhold?.(), 1000);
  unhold = () => {
    window.clearTimeout(timer);
    if (window.scrollTo === note) window.scrollTo = own;
    unhold = null;
  };
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

// Once the transition is over, the page put back as the window scrolls to
// where it shows it, which shows no change (nor undoes any scrolling
// meanwhile)
function settleAfter(root: HTMLElement, done?: () => void) {
  afterTransition(() => {
    done?.();
    // Where the page shows it, read before it's put back, as the page
    // getting shorter then may cut the window's scroll short for a moment
    const top = pageScrollY();
    shiftPage(root, 0);
    window.scrollTo({ top, behavior: 'instant' });
  });
}

// In the layout around every page, ahead of the page itself, so it's done
// before the new page's own first look at itself (which would have the
// browser cut the scroll down to the short page it would otherwise be for
// a moment): going forward, lets the new page down as it opens, and takes
// it back up to the top, out of sight, once it's in; going back, lets it
// down for now as though it opened at its top, until ReturnedScroll knows
// better
export function CarriedScroll() {
  const { key } = useLocation();
  useLayoutEffect(() => {
    const root = document.getElementById('root');
    if (!root) return;
    if (carried) {
      shiftPage(root, carried);
      settleAfter(root, () => (carried = 0));
    } else if (leaving !== null) shiftPage(root, leaving);
  }, [key]);
  return null;
}

// In the layout around every page, after ScrollRestoration: going back,
// the page returned to shown as far down as the router would have had the
// window go, the window itself still where it was. What follows the scroll
// hears of the page's new place.
export function ReturnedScroll() {
  const { key } = useLocation();
  useLayoutEffect(() => {
    if (leaving === null) return;
    unhold?.();
    const from = leaving;
    const to = wanted ?? from;
    leaving = wanted = null;
    const root = document.getElementById('root');
    if (!root) return;
    shiftPage(root, from - to);
    if (from !== to) settleAfter(root);
    window.dispatchEvent(new Event('scroll'));
  }, [key]);
  return null;
}
