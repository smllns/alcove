import { useLayoutEffect, useState } from 'react';

// How far down the screen an element ends, in pixels, kept up to date as
// it or the window changes size. For fitting things into the room below.
// Returns a ref to put on the element: it may appear later than the
// component (once data has loaded, say), and is measured when it does.
export function useBottomEdge() {
  const [element, setElement] = useState<HTMLElement | null>(null);
  const [bottom, setBottom] = useState(0);

  // Before the paint, so whatever is fitted below it never jumps
  useLayoutEffect(() => {
    if (!element) return;
    const measure = () =>
      setBottom(Math.round(element.getBoundingClientRect().bottom));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    window.addEventListener('resize', measure);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [element]);

  return [setElement, bottom] as const;
}
