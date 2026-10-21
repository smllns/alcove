// Keeps `el` where it is on the screen for `ms`, while what's above it on
// the page closes up (a long text folding back, a list getting shorter):
// the page scrolls along with it, so the reader goes on looking at the same
// part of it rather than having it slide away. The browser's own scroll
// anchoring is held off meanwhile, so the two don't both correct it.
export function keepInPlace(el: Element | null, ms: number) {
  if (!el) return;
  const root = document.documentElement;
  const start = el.getBoundingClientRect().top;
  const anchoring = root.style.overflowAnchor;
  root.style.overflowAnchor = 'none';
  const until = performance.now() + ms + 60;
  const step = () => {
    const drift = el.getBoundingClientRect().top - start;
    if (Math.abs(drift) >= 0.5) window.scrollBy(0, drift);
    if (performance.now() < until) requestAnimationFrame(step);
    else root.style.overflowAnchor = anchoring;
  };
  requestAnimationFrame(step);
}
