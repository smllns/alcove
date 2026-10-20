import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { holdPointer } from './canvasCursor';

// Shows a pointer over the canvas while something in it is hovered. Only on
// the canvas itself: never over the page's own buttons and links.
export function useHoverCursor(hovered: boolean) {
  const canvas = useThree((state) => state.gl.domElement);
  useEffect(
    () => (hovered ? holdPointer(canvas) : undefined),
    [hovered, canvas],
  );
}
