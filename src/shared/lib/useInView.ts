import { useEffect, useRef, useState } from 'react';

// Ref for an element, and whether it's within `margin` of the viewport.
// Handy as a sentinel for loading more as you scroll.
export function useInView<T extends Element>(margin = '600px') {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      {
        rootMargin: margin,
      },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [margin]);

  return [ref, inView] as const;
}
