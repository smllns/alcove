import type { MouseEvent } from 'react';

// A plain click on a link: not one opening it in a new tab or window
export const isPlainClick = (e: MouseEvent) =>
  e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey;
