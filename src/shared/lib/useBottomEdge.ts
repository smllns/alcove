import { useLayoutEffect, useState } from 'react';
import { pageScrollY } from './pageScroll';

// How far down the page an element ends, in pixels, kept up to date as it
// or the window changes size: from the page's top, so it reads the same
// however far the page happens to be scrolled while it's measured. For fitting things
// into the room below, on a page that doesn't scroll.
// Returns a ref to put on the element: it may appear later than the
// component (once data has loaded, say), and is measured when it does;
// and the element itself, once it's there.
export function useBottomEdge() {
  const [element, setElement] = useState<HTMLElement | null>(null);
  const [bottom, setBottom] = useState(0);

  // Before the paint, so whatever is fitted below it never jumps
  useLayoutEffect(() => {
    if (!element) return;
    const measure = () =>
      setBottom(
        Math.round(
          element.getBoundingClientRect().bottom + pageScrollY(element),
        ),
      );
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    window.addEventListener('resize', measure);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [element]);

  return [setElement, bottom, element] as const;
}
