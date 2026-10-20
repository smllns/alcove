import { useEffect, useRef, useState, type RefObject } from 'react';

type Point = { x: number; y: number };

// Movement under this, in screen pixels, is a tap rather than a drag
const DRAG_AFTER = 5;

// The sky's pointer and wheel handling, turned into pans and zooms: a drag
// moves it, two fingers pinch it, a trackpad pinch (a wheel with ctrl held)
// zooms it and a plain wheel or two-finger scroll moves it. `onGrab` is
// told when a hand goes on it, to stop anything else moving it.
export function useSkyGestures(
  sky: RefObject<HTMLDivElement | null>,
  {
    pan,
    zoomAt,
    onGrab,
  }: {
    pan: (dx: number, dy: number) => void;
    zoomAt: (px: number, py: number, factor: number) => void;
    onGrab: () => void;
  },
) {
  const [dragging, setDragging] = useState(false);
  const pointers = useRef(new Map<number, Point>());
  // Where a press began, to tell a drag from a click
  const start = useRef<Point | null>(null);

  // Has to be a non-passive listener to keep the page itself from
  // scrolling or zooming
  useEffect(() => {
    const el = sky.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const box = el.getBoundingClientRect();
      if (e.ctrlKey || e.deltaMode !== 0) {
        zoomAt(
          e.clientX - box.left,
          e.clientY - box.top,
          Math.exp(-e.deltaY * (e.ctrlKey ? 0.01 : 0.1)),
        );
      } else {
        pan(-e.deltaX, -e.deltaY);
      }
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [sky, zoomAt, pan]);

  const local = (e: React.PointerEvent): Point => {
    const box = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - box.left, y: e.clientY - box.top };
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Buttons over the sky (zoom, fit) work as buttons, not as a drag
    if (e.button !== 0 || (e.target as Element).closest('button')) return;
    onGrab();
    e.currentTarget.setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, local(e));
    if (pointers.current.size === 1) start.current = local(e);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const previous = pointers.current.get(e.pointerId);
    if (!previous) return;
    const now = local(e);
    const others = [...pointers.current.entries()].filter(
      ([id]) => id !== e.pointerId,
    );

    if (others.length === 1) {
      // Two fingers: zoom by how much they spread, pan by their middle
      const [, other] = others[0];
      const before = Math.hypot(previous.x - other.x, previous.y - other.y);
      const after = Math.hypot(now.x - other.x, now.y - other.y);
      if (before > 0)
        zoomAt((now.x + other.x) / 2, (now.y + other.y) / 2, after / before);
      pan((now.x - previous.x) / 2, (now.y - previous.y) / 2);
      setDragging(true);
    } else if (others.length === 0) {
      const from = start.current;
      if (
        dragging ||
        (from && Math.hypot(now.x - from.x, now.y - from.y) > DRAG_AFTER)
      ) {
        setDragging(true);
        pan(now.x - previous.x, now.y - previous.y);
      }
    }
    pointers.current.set(e.pointerId, now);
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!pointers.current.delete(e.pointerId)) return;
    if (pointers.current.size > 0) return;
    setDragging(false);
    start.current = null;
  };

  return {
    dragging,
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel: onPointerUp,
    },
  };
}
