import { useState, type KeyboardEvent, useRef } from 'react';
import {
  centred,
  covering,
  zoomedAround,
  type Placed,
  type Size,
} from '@/shared/lib/crop';
import { usePanZoom } from '@/shared/lib/usePanZoom';

// How much a step of the keys (or buttons) zooms, and how far it moves
export const STEP = 1.25;
const NUDGE = 12;

// How a photo is placed in a frame (`box`, `frame` big) by hand: dragged
// about with a finger or the pointer, pinched or wheeled to zoom around
// where it's pinched or pointed at, nudged with the arrows and zoomed with
// + and -, always covering the frame (shared/lib/crop)
export function usePhotoPlacing(photo: Size | null, frame: Size) {
  const [placed, setPlaced] = useState<Placed>(centred);
  const box = useRef<HTMLDivElement>(null);

  // A point of the frame from its top left as one from its middle
  const fromMiddle = (x: number, y: number) => ({
    x: x - frame.width / 2,
    y: y - frame.height / 2,
  });
  const zoomTo = (zoom: number, at?: { x: number; y: number }) =>
    photo && setPlaced((was) => zoomedAround(photo, frame, was, zoom, at));
  const moveBy = (dx: number, dy: number) =>
    photo &&
    setPlaced((was) =>
      covering(photo, frame, { ...was, x: was.x + dx, y: was.y + dy }),
    );

  // Dragged, pinched and wheeled as the sky is (usePanZoom), the wheel
  // zooming rather than moving it
  const gestures = usePanZoom(box, {
    pan: moveBy,
    zoomAt: (x, y, factor) =>
      photo &&
      setPlaced((was) =>
        zoomedAround(photo, frame, was, was.zoom * factor, fromMiddle(x, y)),
      ),
    wheelZooms: true,
  });

  return {
    placed,
    reset: () => setPlaced(centred),
    zoomTo,
    box,
    handlers: {
      ...gestures.handlers,
      onKeyDown: (e: KeyboardEvent) => {
        const keys: Record<string, () => unknown> = {
          ArrowLeft: () => moveBy(NUDGE, 0),
          ArrowRight: () => moveBy(-NUDGE, 0),
          ArrowUp: () => moveBy(0, NUDGE),
          ArrowDown: () => moveBy(0, -NUDGE),
          '+': () => zoomTo(placed.zoom * STEP),
          '=': () => zoomTo(placed.zoom * STEP),
          '-': () => zoomTo(placed.zoom / STEP),
        };
        if (!keys[e.key]) return;
        e.preventDefault();
        keys[e.key]();
      },
    },
  };
}
