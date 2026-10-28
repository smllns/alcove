import { useRef, type PointerEvent, type RefObject } from 'react';
import { gsap } from './gsap';

// How far it's pulled before letting go puts it away; or how fast it's
// flung down (px per ms), however short the way
const AWAY = 120;
const FLING = 0.5;
// Further than this, it was pulled, not tapped
const TAP = 8;

type Pull = { id: number; y: number; dy: number; at: number; v: number };

// A panel come up from the bottom of a phone's screen, pulled back down
// by its top (anything in it marked data-grab): it follows the finger
// (pulled up, only a little), the dimmed page behind it brightening as it
// goes; let go far or fast enough and `away` is called with it where it
// is, otherwise it settles back. `on`: whether it can be pulled now.
export function usePullDown(
  panel: RefObject<HTMLElement | null>,
  scrim: RefObject<HTMLElement | null>,
  away: () => void,
  on: () => boolean,
) {
  const pull = useRef<Pull | null>(null);
  const moved = useRef(false);

  // Back where it was, the page behind dimmed again
  const settle = () => {
    gsap.to(panel.current, { y: 0, duration: 0.4, ease: 'power3.out' });
    gsap.to(scrim.current, { opacity: 1, duration: 0.4 });
  };

  const place = (dy: number) => {
    const box = panel.current;
    if (!box) return;
    gsap.set(box, { y: dy });
    if (scrim.current)
      gsap.set(scrim.current, {
        opacity: 1 - Math.min(Math.max(dy, 0) / box.offsetHeight, 1) * 0.8,
      });
  };

  return {
    onPointerDown: (e: PointerEvent<HTMLElement>) => {
      if (!on() || !e.isPrimary || e.button !== 0) return;
      const target = e.target as Element;
      if (!target.closest('[data-grab]') || target.closest('button')) return;
      moved.current = false;
      pull.current = {
        id: e.pointerId,
        y: e.clientY,
        dy: 0,
        at: e.timeStamp,
        v: 0,
      };
    },
    onPointerMove: (e: PointerEvent<HTMLElement>) => {
      const p = pull.current;
      if (!p || e.pointerId !== p.id) return;
      const raw = e.clientY - p.y;
      if (!moved.current) {
        if (Math.abs(raw) < TAP) return;
        moved.current = true;
        e.currentTarget.setPointerCapture(e.pointerId);
      }
      const dy = raw > 0 ? raw : raw * 0.15;
      const dt = e.timeStamp - p.at;
      // How fast, smoothed a little over the last few moves
      if (dt > 0) p.v = p.v * 0.4 + ((dy - p.dy) / dt) * 0.6;
      p.dy = dy;
      p.at = e.timeStamp;
      place(dy);
    },
    onPointerUp: (e: PointerEvent<HTMLElement>) => {
      const p = pull.current;
      if (!p || e.pointerId !== p.id) return;
      pull.current = null;
      if (!moved.current) return;
      const flung = e.timeStamp - p.at < 100 && p.v > FLING;
      if (p.dy > AWAY || flung) away();
      else settle();
    },
    onPointerCancel: () => {
      if (!pull.current) return;
      pull.current = null;
      settle();
    },
  };
}
