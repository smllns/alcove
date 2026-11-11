import { useLayoutEffect, useRef } from 'react';

// How tall the grid's rows are: small, so each card's height is matched
// closely by the rows it spans
const ROW = 4;

// A grid of cards of every height laid as a mason lays stones: each in
// turn set at the top of whichever column ends highest, so a long one
// leaves the cards after it to fill the other columns, in order, and the
// whole takes as little height as it can. Each card is measured and spans
// as many rows as it's tall, `gap` under it; the grid's own placing does
// the rest. In a single column, as it's laid out anyway. Measured before
// the page is painted, and again whenever a card changes size.
export function useMasonry<T extends HTMLElement>(gap: number) {
  const grid = useRef<T>(null);
  useLayoutEffect(() => {
    const box = grid.current;
    if (!box) return;
    const cards = () => Array.from(box.children) as HTMLElement[];
    const fit = () => {
      const laid =
        getComputedStyle(box).gridTemplateColumns.split(' ').length > 1;
      box.style.gridAutoRows = laid ? `${ROW}px` : '';
      box.style.rowGap = laid ? '0px' : '';
      // No gap under the last row
      box.style.marginBottom = laid ? `-${gap}px` : '';
      for (const card of cards()) {
        card.style.alignSelf = laid ? 'start' : '';
        card.style.gridRowEnd = laid
          ? `span ${Math.ceil((card.offsetHeight + gap) / ROW)}`
          : '';
      }
    };
    // Each card watched as it comes (a bookcase added, say), and all laid
    // again
    const sized = new ResizeObserver(fit);
    const watch = () => {
      sized.disconnect();
      sized.observe(box);
      for (const card of cards()) sized.observe(card);
      fit();
    };
    watch();
    const added = new MutationObserver(watch);
    added.observe(box, { childList: true });
    return () => {
      added.disconnect();
      sized.disconnect();
    };
  }, [gap]);
  return grid;
}
