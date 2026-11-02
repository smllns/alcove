import { useEffect, useRef, useState } from 'react';
import { pageScroller, scrollPageToElement } from './pageScroll';

// Which of a page's parts (by their ids, top to bottom) is being read: the
// last whose top has come up past the upper part of the screen. And a way
// down to one, marked as soon as it's chosen and kept marked (though the
// page may not scroll far enough to bring it up top) until the reader
// scrolls on themselves.
export function useReadingAt(ids: string[]) {
  const [shown, setShown] = useState(ids[0]);
  const chosen = useRef<string | null>(null);
  const key = ids.join(' ');

  useEffect(() => {
    const parts = key.split(' ');
    const scroller = pageScroller();
    const onScroll = () => {
      if (chosen.current) return;
      let reading = parts[0];
      for (const id of parts) {
        const part = document.getElementById(id);
        if (part && part.getBoundingClientRect().top < innerHeight * 0.4)
          reading = id;
      }
      setShown(reading);
    };
    const letGo = () => (chosen.current = null);
    scroller.addEventListener('scroll', onScroll, { passive: true });
    for (const event of ['wheel', 'touchmove', 'keydown'])
      addEventListener(event, letGo, { passive: true });
    return () => {
      scroller.removeEventListener('scroll', onScroll);
      for (const event of ['wheel', 'touchmove', 'keydown'])
        removeEventListener(event, letGo);
    };
  }, [key]);

  const goTo = (id: string) => {
    const part = document.getElementById(id);
    if (!part) return;
    chosen.current = id;
    setShown(id);
    scrollPageToElement(part);
  };
  return [shown, goTo] as const;
}
