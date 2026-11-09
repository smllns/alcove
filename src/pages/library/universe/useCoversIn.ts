import { useEffect, useState, type RefObject } from 'react';

// How often it's looked whether the covers in view have come, and the
// longest they're waited for
const LOOK_MS = 120;
const MOST_MS = 4000;

// Whether the covers in view in the sky have come (or failed), once every
// book is in (`ready`): waited for, so the sky comes in whole rather than
// a cover at a time, but no longer than MOST_MS. Covers further off come
// as the sky is moved to them. Once come, it stays so.
export function useCoversIn(
  sky: RefObject<HTMLElement | null>,
  ready: boolean,
) {
  const [come, setCome] = useState(false);
  useEffect(() => {
    if (!ready || come) return;
    const began = performance.now();
    const look = window.setInterval(() => {
      const el = sky.current;
      if (!el) return;
      const box = el.getBoundingClientRect();
      const waiting = Array.from(el.querySelectorAll('img')).some((img) => {
        if (img.complete) return false;
        const at = img.getBoundingClientRect();
        return (
          at.right > box.left &&
          at.left < box.right &&
          at.bottom > box.top &&
          at.top < box.bottom
        );
      });
      if (!waiting || performance.now() - began > MOST_MS) setCome(true);
    }, LOOK_MS);
    return () => window.clearInterval(look);
  }, [sky, ready, come]);
  return come;
}
