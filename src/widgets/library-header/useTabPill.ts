import {
  useEffect,
  useLayoutEffect,
  useState,
  type CSSProperties,
  type RefObject,
} from 'react';
import { turnBegun } from '@/shared/lib/stillWhileTurning';

// Where the open tab's shading goes: over the tab in `list` for section
// `shown` (data-section), measured again whenever the tabs change size.
// Placed at once the first time, and gliding from tab to tab after that,
// as the page turns to the section chosen rather than before it begins
// to (turnBegun: at once with no page turning). `lit`: the tab it's over,
// or on its way to, for the tabs to change colour along with it.
export function useTabPill(
  list: RefObject<HTMLElement | null>,
  shown?: string,
) {
  const [at, setAt] = useState<CSSProperties | null>(null);
  const [lit, setLit] = useState(shown);
  const [glides, setGlides] = useState(false);
  useLayoutEffect(() => {
    const tabs = list.current;
    if (!tabs) return;
    let gone = false;
    const measure = () => {
      const tab = shown
        ? tabs.querySelector<HTMLElement>(`[data-section="${shown}"]`)
        : null;
      const box = tab && {
        translate: `${tab.offsetLeft}px ${tab.offsetTop}px`,
        width: tab.offsetWidth,
        height: tab.offsetHeight,
      };
      void turnBegun().then(() => {
        if (gone) return;
        setAt(box);
        setLit(shown);
      });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(tabs);
    return () => {
      gone = true;
      observer.disconnect();
    };
  }, [list, shown]);
  // Gliding only once it's been drawn in place
  useEffect(() => {
    if (!at || glides) return;
    const frame = requestAnimationFrame(() => setGlides(true));
    return () => cancelAnimationFrame(frame);
  }, [at, glides]);
  return { at, glides, lit };
}
