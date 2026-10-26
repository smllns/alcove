// How long a book let go of takes to settle back (--settle, stars.css)
const SETTLING = 900;
const settling = new WeakMap<HTMLElement, number>();

// A book the pointer has just left, kept over the rest of the sky
// (data-leaving, stars.css) while it settles back to its size, rather
// than dropping at once under the books round it and the dimming veil
export function letGo(star: HTMLElement) {
  window.clearTimeout(settling.get(star));
  star.setAttribute('data-leaving', '');
  settling.set(
    star,
    window.setTimeout(() => star.removeAttribute('data-leaving'), SETTLING),
  );
}
