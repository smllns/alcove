import { useEffect, useState } from 'react';

// Whether `el` (whatever sits at the top, say a title) has scrolled out of
// sight above
export function useScrolledPast(el: Element | null) {
  const [past, setPast] = useState(false);
  useEffect(() => {
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) =>
      setPast(!entry.isIntersecting && entry.boundingClientRect.top < 0),
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [el]);
  return past;
}
