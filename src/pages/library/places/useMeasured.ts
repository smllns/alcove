import { useEffect, useState, type RefObject } from 'react';

// Something about an element measured off the page (by `read`) and
// measured again whenever it changes size, for a drawing over it to fit.
// After the page is laid out rather than during it: the element may be a
// parent's, whose ref is only set once its children's own layout effects
// have run. `read` is how to measure, never changing.
export function useMeasured<T>(
  element: RefObject<HTMLElement | null>,
  read: (element: HTMLElement) => T,
) {
  const [measured, setMeasured] = useState<T | null>(null);
  useEffect(() => {
    const target = element.current;
    if (!target) return;
    const observer = new ResizeObserver(() => setMeasured(read(target)));
    observer.observe(target);
    return () => observer.disconnect();
  }, [element, read]);
  return measured;
}
