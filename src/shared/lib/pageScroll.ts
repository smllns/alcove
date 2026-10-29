// Each page scrolls in a box of its own (app/PageScroll), never the
// window. Where the page is scrolled to is read and set here.

import { isTurning } from './stillWhileTurning';

const BOX = '[data-page-scroll]';

// The box the page scrolls in: the one around `el`, or else the page's
// on screen now
export const pageScroller = (el?: Element | null) =>
  el?.closest<HTMLElement>(BOX) ??
  document.querySelector<HTMLElement>(BOX) ??
  document.documentElement;

// How far down the page is scrolled
export const pageScrollY = (el?: Element | null) => pageScroller(el).scrollTop;

// Over to `top` of the page
export const scrollPageTo = (
  top: number,
  behavior: ScrollBehavior = 'instant',
  el?: Element | null,
) => pageScroller(el).scrollTo({ top, behavior });

// Smoothly down (or up) to `el`, stopping with it as far under the top of
// the screen as it asks (its scroll-margin-top: clear of the tabs floating
// there, say)
export const scrollPageToElement = (el: Element) =>
  scrollPageTo(
    pageScrollY(el) +
      el.getBoundingClientRect().top -
      (parseFloat(getComputedStyle(el).scrollMarginTop) || 0),
    'smooth',
    el,
  );

// The window put back where it always is, at the top, once a phone's
// keyboard has gone and left it scrolled (as an iPhone does, bringing a
// field into view): left so, the page is drawn where it was but takes taps
// as if moved, so nothing, not even the menu, answers where it's seen.
// Never while a page turns (Safari blinks if the window moves then).
export function keepWindowStill() {
  const view = window.visualViewport;
  if (!view) return;
  view.addEventListener('resize', () => {
    const keyboardGone = view.height >= window.innerHeight - 1;
    if (keyboardGone && window.scrollY && !isTurning()) window.scrollTo(0, 0);
  });
}

// Told on going to an address in place of another (navigate's `state`,
// with `replace`), that it's the same page still, its box and all kept:
// a list's page, say, its address its own once the list's made
export type SamePage = { page: string };
