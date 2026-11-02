import { useEffect, useRef, type PointerEvent, type RefObject } from 'react';
import { gsap } from './gsap';

// How far it's pulled before letting go puts it away; or how fast it's
// flung down (px per ms), however short the way
const AWAY = 120;
const FLING = 0.5;
// Further than this, it was pulled, not tapped
const TAP = 8;

// A pull under way: by a pointer on the panel's top (`id`), or by touch
type Pull = { y: number; dy: number; at: number; v: number; id?: number };

// The box `el` scrolls in inside the panel, if it's in one that can
const scrollerOf = (el: Element | null, panel: HTMLElement) => {
  for (let at = el; at && at !== panel.parentElement; at = at.parentElement)
    if (
      at instanceof HTMLElement &&
      at.scrollHeight > at.clientHeight + 1 &&
      /auto|scroll/.test(getComputedStyle(at).overflowY)
    )
      return at;
  return null;
};

// A panel come up from the bottom of a phone's screen, pulled back down:
// by its top (anything in it marked data-grab), or by a finger drawn down
// anywhere on it while what's under the finger is scrolled to its top (so
// scrolling it is still scrolling, and only a pull past its top pulls the
// panel). It follows the finger (pulled up, only a little), the dimmed
// page behind it brightening as it goes; let go far or fast enough and
// `away` is called with it where it is, otherwise it settles back. `on`:
// whether it can be pulled now.
export function usePullDown(
  panel: RefObject<HTMLElement | null>,
  scrim: RefObject<HTMLElement | null>,
  away: () => void,
  on: () => boolean,
) {
  const pull = useRef<Pull | null>(null);
  const moved = useRef(false);
  const latest = useRef({ away, on });
  useEffect(() => {
    latest.current = { away, on };
  });

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

  // The pull followed, given how far from where it started, and when
  const follow = (raw: number, at: number) => {
    const p = pull.current!;
    const dy = raw > 0 ? raw : raw * 0.15;
    const dt = at - p.at;
    // How fast, smoothed a little over the last few moves
    if (dt > 0) p.v = p.v * 0.4 + ((dy - p.dy) / dt) * 0.6;
    p.dy = dy;
    p.at = at;
    place(dy);
  };
  const letGo = (at: number) => {
    const p = pull.current;
    pull.current = null;
    if (!p || !moved.current) return;
    const flung = at - p.at < 100 && p.v > FLING;
    if (p.dy > AWAY || flung) latest.current.away();
    else settle();
  };

  // Drawn down anywhere on it: by touch, so a pull past the top of what's
  // scrolled can stop the page's own scrolling taking it
  useEffect(() => {
    const box = panel.current;
    if (!box) return;
    let start: { y: number; scroller: HTMLElement | null } | null = null;
    let pulling = false;
    const down = (e: TouchEvent) => {
      const target = e.target as Element;
      if (
        !latest.current.on() ||
        e.touches.length > 1 ||
        target.closest('[data-grab]')
      )
        return;
      start = { y: e.touches[0].clientY, scroller: scrollerOf(target, box) };
      pulling = false;
    };
    const move = (e: TouchEvent) => {
      if (!start) return;
      const raw = e.touches[0].clientY - start.y;
      if (!pulling) {
        if (Math.abs(raw) < TAP) return;
        // Up, or down through what's still scrolled: its own scrolling
        if (raw < 0 || (start.scroller?.scrollTop ?? 0) > 0) {
          start = null;
          return;
        }
        pulling = true;
        moved.current = true;
        pull.current = { y: start.y, dy: 0, at: e.timeStamp, v: 0 };
      }
      e.preventDefault();
      follow(raw, e.timeStamp);
    };
    const up = (e: TouchEvent) => {
      if (pulling) letGo(e.timeStamp);
      start = null;
      pulling = false;
    };
    box.addEventListener('touchstart', down, { passive: true });
    box.addEventListener('touchmove', move, { passive: false });
    box.addEventListener('touchend', up);
    box.addEventListener('touchcancel', up);
    return () => {
      box.removeEventListener('touchstart', down);
      box.removeEventListener('touchmove', move);
      box.removeEventListener('touchend', up);
      box.removeEventListener('touchcancel', up);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [panel]);

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
      follow(raw, e.timeStamp);
    },
    onPointerUp: (e: PointerEvent<HTMLElement>) => {
      const p = pull.current;
      if (!p || e.pointerId !== p.id) return;
      letGo(e.timeStamp);
    },
    onPointerCancel: () => {
      const p = pull.current;
      if (!p || p.id === undefined) return;
      pull.current = null;
      settle();
    },
  };
}
