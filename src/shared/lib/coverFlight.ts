// A book's cover flying between its place on the shelves and the book's
// own page, over the page turning underneath. Covers say whose they are
// (data-cover-of); just before the page changes, the one book's covers are
// given a single View Transition name, so the cover on the way out and the
// cover on the way in are taken for one and the same.

let rule: HTMLStyleElement | null = null;
let clearing: number | undefined;

// The book's cover that flies: `from`, the one clicked, when a page shows
// it more than once (a star in the sky and a line in the search list, say;
// two of the same name and the browser gives up on the transition), along
// with the cover on the book's own page
export function flyCoverOf(id: string, from?: Element | null) {
  rule ??= document.head.appendChild(document.createElement('style'));
  const cover = `[data-cover-of="${CSS.escape(id)}"]`;
  const flying = from
    ? `:is(${cover}[data-flying], ${cover}[data-cover-home])`
    : cover;
  rule.textContent = `:root:is([data-transition='forward'], [data-transition='return']) ${flying} { view-transition-name: flying-cover; }`;
  from?.setAttribute('data-flying', '');
  // Leaving from a book faded back on the shelf (transitions.css)
  const root = document.documentElement;
  if (document.querySelector(`.shelf-faded:not(:hover) ${cover}`))
    root.dataset.flightFaded = '';
  // Only for this one change of page; the names are taken as it starts
  window.clearTimeout(clearing);
  clearing = window.setTimeout(() => {
    if (rule) rule.textContent = '';
    from?.removeAttribute('data-flying');
    delete root.dataset.flightFaded;
  }, 1500);
}

// Leaving a book's page by going back: its cover flies home to its place
// on the shelves. The page marks that cover (data-cover-home).
export function flyCoverHome() {
  const home = document.querySelector<HTMLElement>('[data-cover-home]');
  const id = home?.dataset.coverOf;
  if (id) flyCoverOf(id);
}
