import { useLayoutEffect, useRef, useState } from 'react';

// How many pixels across a drawing is shown at its designed size
const MOST = 640;

// How wide a drawing of the stats is drawn, in its own units: `base`, as
// it's designed, on a narrow column (a phone, scaled down to fit), and on a
// wider one more of it, at the size it has MOST pixels across, so it
// fills the column across without growing any taller. Measured off the
// column before the page is painted, and again as it changes; `svg`, for
// the drawing to be measured by.
export function useDrawingWidth(base: number) {
  const svg = useRef<SVGSVGElement>(null);
  const [width, setWidth] = useState(base);
  useLayoutEffect(() => {
    const column = svg.current?.parentElement;
    if (!column) return;
    const fit = () =>
      setWidth(Math.max(base, Math.round((column.clientWidth * base) / MOST)));
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(column);
    return () => observer.disconnect();
  }, [base]);
  return { svg, width };
}
