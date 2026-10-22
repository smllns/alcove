import { useRef, type PointerEvent } from 'react';

// How far it's carried, up or down, before letting go puts it away; or
// how fast it's flung (px per ms), however short the way
const AWAY = 110;
const FLING = 0.5;
// Further than this, it was carried, not tapped
const TAP = 8;

type Drag = {
  id: number;
  x: number;
  y: number;
  dy: number;
  at: number;
  v: number;
};

// Something shown over everything (a cover drawn up to fill the screen)
// put away by swiping it off, up or down, as photos are on a phone: it
// follows the finger, shrinking a little, while the veil behind it pales;
// let go far or fast enough and `away` is called with it where it is,
// otherwise it settles back. Moved straight on the elements, not by
// re-rendering. `item` is what's carried, `veil` what pales; the handlers
// go on what covers the screen. A drag isn't a tap: `dragged()` says so,
// for the click that follows it.
export function useSwipeAway(away: () => void) {
  const item = useRef<HTMLDivElement>(null);
  const veil = useRef<HTMLDivElement>(null);
  const drag = useRef<Drag | null>(null);
  const moved = useRef(false);

  const place = (dx: number, dy: number) => {
    const far = Math.min(Math.abs(dy) / 600, 1);
    if (item.current)
      item.current.style.transform =
        dy || dx
          ? `translate(${dx * 0.35}px, ${dy}px) scale(${1 - far * 0.2})`
          : '';
    if (veil.current) veil.current.style.opacity = String(1 - far * 0.8);
  };

  // Back to where it was, softly
  const settle = () => {
    for (const el of [item.current, veil.current]) {
      if (!el) continue;
      el.style.transition =
        'transform 0.45s var(--ease-soft), opacity 0.45s var(--ease-soft)';
      el.addEventListener('transitionend', () => (el.style.transition = ''), {
        once: true,
      });
    }
    place(0, 0);
  };

  const handlers = {
    onPointerDown: (e: PointerEvent<HTMLElement>) => {
      if (!e.isPrimary || e.button !== 0) return;
      // A button over it (the ×) is pressed, not dragged
      if ((e.target as Element).closest('button')) return;
      moved.current = false;
      drag.current = {
        id: e.pointerId,
        x: e.clientX,
        y: e.clientY,
        dy: 0,
        at: e.timeStamp,
        v: 0,
      };
      e.currentTarget.setPointerCapture(e.pointerId);
    },
    onPointerMove: (e: PointerEvent<HTMLElement>) => {
      const d = drag.current;
      if (!d || e.pointerId !== d.id) return;
      const dx = e.clientX - d.x;
      const dy = e.clientY - d.y;
      if (Math.hypot(dx, dy) > TAP) moved.current = true;
      if (!moved.current) return;
      const dt = e.timeStamp - d.at;
      // How fast, smoothed a little over the last few moves
      if (dt > 0) d.v = d.v * 0.4 + ((dy - d.dy) / dt) * 0.6;
      d.dy = dy;
      d.at = e.timeStamp;
      place(dx, dy);
    },
    onPointerUp: (e: PointerEvent<HTMLElement>) => {
      const d = drag.current;
      if (!d || e.pointerId !== d.id) return;
      drag.current = null;
      if (!moved.current) return;
      // A fling counts only going the way it's carried, and only if fresh
      const flung =
        e.timeStamp - d.at < 100 &&
        Math.abs(d.v) > FLING &&
        Math.sign(d.v) === Math.sign(d.dy);
      if (Math.abs(d.dy) > AWAY || flung) away();
      else settle();
    },
    onPointerCancel: () => {
      if (!drag.current) return;
      drag.current = null;
      settle();
    },
  };

  return { item, veil, handlers, dragged: () => moved.current };
}
