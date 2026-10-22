// Each page scrolls in a box of its own (app/PageScroll), never the
// window. Where the page is scrolled to is read and set here.

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
