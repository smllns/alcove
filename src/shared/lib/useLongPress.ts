import { useRef, type MouseEvent, type PointerEvent } from 'react';

// How long a press is held to count, and how far the finger may wander
const HOLD = 450;
const SLACK = 8;

// A press held a moment on something (a finger on a phone, the mouse
// too), for `onHold`; the click that ends it then let go by unheard
// (`heard`), so the press doesn't also open what was pressed
export function useLongPress(onHold: () => void) {
  const timer = useRef<number | undefined>(undefined);
  const from = useRef<{ x: number; y: number } | null>(null);
  const held = useRef(false);
  const stop = () => {
    window.clearTimeout(timer.current);
    from.current = null;
  };
  return {
    handlers: {
      onPointerDown: (e: PointerEvent) => {
        if (e.button !== 0) return;
        held.current = false;
        from.current = { x: e.clientX, y: e.clientY };
        timer.current = window.setTimeout(() => {
          held.current = true;
          onHold();
        }, HOLD);
      },
      onPointerMove: (e: PointerEvent) => {
        const start = from.current;
        if (
          start &&
          Math.hypot(e.clientX - start.x, e.clientY - start.y) > SLACK
        )
          stop();
      },
      onPointerUp: stop,
      onPointerCancel: stop,
      onPointerLeave: stop,
      // Not the phone's own menu for a link held on
      onContextMenu: (e: MouseEvent) => e.preventDefault(),
    },
    // Whether the click now is one ending a long press, to let it go by
    heard: () => {
      const was = held.current;
      held.current = false;
      return was;
    },
  };
}
