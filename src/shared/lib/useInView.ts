import { useEffect, useRef, useState } from 'react';

// Ref for an element, and whether it's within `margin` of the viewport.
// Handy as a sentinel for loading more as you scroll. `initially`: what
// to assume before it's first looked at.
export function useInView<T extends Element>(
  margin = '600px',
  initially = false,
) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(initially);

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
