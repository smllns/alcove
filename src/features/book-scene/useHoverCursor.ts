import { useEffect } from 'react';

// Shows a pointer while something in the canvas is hovered
export function useHoverCursor(hovered: boolean) {
  useEffect(() => {
    if (!hovered) return;
    document.body.style.cursor = 'pointer';
    return () => {
      document.body.style.cursor = '';
    };
  }, [hovered]);
}
