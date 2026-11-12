import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from 'react';

// How far the mouse moves before it drags, how long a finger holds before
// it does (a swipe before then still scrolls the page), and how long the
// others take to slide aside
const MOVE = 5;
const HOLD = 350;
const SLIDE = 'transform 300ms cubic-bezier(0.22, 1, 0.36, 1)';

type Point = { x: number; y: number };

// Things in a row (`ids`, each element marked with data-drag-id inside
// `box`) put in another order by hand: the one dragged follows the
// pointer, the others sliding aside as it passes over their places, and,
// let go, the new order handed to `onOrder` (only if it changed). Focused,
// Alt with ← or → moves one a place. The click ending a drag is let go by.
export function useDragOrder(ids: string[], onOrder: (ids: string[]) => void) {
  const box = useRef<HTMLUListElement>(null);
  // The order while dragging, and which one, where it was taken hold of
  const [order, setOrder] = useState<string[] | null>(null);
  const [dragged, setDragged] = useState<string | null>(null);
  const [at, setAt] = useState<Point>({ x: 0, y: 0 });
  const press = useRef<{
    id: string;
    from: Point;
    grab: Point;
    timer?: number;
  } | null>(null);
  // Where each place in the row is, measured as a drag begins
  const places = useRef<DOMRect[]>([]);
  const dragging = useRef(false);
  const ended = useRef(false);
  const shown = order ?? ids;
  const placeOf = (id: string) => shown.indexOf(id);

  const elementOf = (id: string) =>
    box.current?.querySelector<HTMLElement>(`[data-drag-id="${id}"]`);
  const begin = (id: string) => {
    places.current = ids.map((each) =>
      elementOf(each)!.getBoundingClientRect(),
    );
    dragging.current = true;
    setOrder(ids);
    setDragged(id);
  };
  const end = () => {
    window.clearTimeout(press.current?.timer);
    press.current = null;
    if (dragging.current) {
      ended.current = true;
      if (order && order.join() !== ids.join()) onOrder(order);
    }
    dragging.current = false;
    setOrder(null);
    setDragged(null);
  };

  // The others slid from where they stood to their new places
  const before = useRef<string[]>(ids);
  useLayoutEffect(() => {
    const was = before.current;
    before.current = shown;
    if (!dragged) return;
    for (const id of shown) {
      if (id === dragged) continue;
      const from = places.current[was.indexOf(id)];
      const to = places.current[shown.indexOf(id)];
      const el = elementOf(id);
      if (!el || !from || !to || from === to) continue;
      el.style.transition = 'none';
      el.style.transform = `translate(${from.left - to.left}px, ${from.top - to.top}px)`;
      void el.offsetWidth;
      el.style.transition = SLIDE;
      el.style.transform = '';
    }
  });

  // A finger dragging doesn't scroll the page under it
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const hold = (e: TouchEvent) => dragging.current && e.preventDefault();
    el.addEventListener('touchmove', hold, { passive: false });
    return () => el.removeEventListener('touchmove', hold);
  }, []);

  const item = (id: string) => {
    const place = places.current[placeOf(id)];
    return {
      'data-drag-id': id,
      style:
        id === dragged && place && press.current
          ? {
              transform: `translate(${at.x - press.current.grab.x - place.left}px, ${at.y - press.current.grab.y - place.top}px)`,
              zIndex: 10,
              cursor: 'grabbing',
            }
          : undefined,
      onPointerDown: (e: PointerEvent<HTMLElement>) => {
        if (e.button !== 0 || (e.target as Element).closest('[data-no-drag]'))
          return;
        const rect = e.currentTarget.getBoundingClientRect();
        const from = { x: e.clientX, y: e.clientY };
        press.current = {
          id,
          from,
          grab: { x: e.clientX - rect.left, y: e.clientY - rect.top },
        };
        setAt(from);
        const target = e.currentTarget;
        const pointer = e.pointerId;
        if (e.pointerType === 'touch')
          press.current.timer = window.setTimeout(() => {
            target.setPointerCapture(pointer);
            begin(id);
          }, HOLD);
      },
      onPointerMove: (e: PointerEvent<HTMLElement>) => {
        const pressed = press.current;
        if (!pressed) return;
        const now = { x: e.clientX, y: e.clientY };
        if (!dragging.current) {
          const moved = Math.hypot(
            now.x - pressed.from.x,
            now.y - pressed.from.y,
          );
          if (e.pointerType === 'touch') {
            if (moved > MOVE) end();
            return;
          }
          if (moved <= MOVE) return;
          e.currentTarget.setPointerCapture(e.pointerId);
          begin(id);
        }
        setAt(now);
        // Into the place whose middle it's nearest
        const nearest = places.current
          .map((rect, i) => ({
            i,
            d: Math.hypot(
              rect.left +
                rect.width / 2 -
                (now.x - pressed.grab.x + rect.width / 2),
              rect.top +
                rect.height / 2 -
                (now.y - pressed.grab.y + rect.height / 2),
            ),
          }))
          .sort((a, b) => a.d - b.d)[0];
        setOrder((was) => {
          const list = (was ?? ids).filter((each) => each !== id);
          list.splice(nearest?.i ?? 0, 0, id);
          return list.join() === (was ?? ids).join() ? was : list;
        });
      },
      onPointerUp: end,
      onPointerCancel: end,
      // No picture of the link dragged off by the browser instead
      onDragStart: (e: { preventDefault: () => void }) => e.preventDefault(),
      // Nor the phone's own menu for a cover held on
      onContextMenu: (e: { preventDefault: () => void }) => e.preventDefault(),
      onClickCapture: (e: {
        preventDefault: () => void;
        stopPropagation: () => void;
      }) => {
        if (!ended.current) return;
        ended.current = false;
        e.preventDefault();
        e.stopPropagation();
      },
      onKeyDown: (e: KeyboardEvent) => {
        if (!e.altKey || (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight'))
          return;
        e.preventDefault();
        const i = ids.indexOf(id);
        const j = i + (e.key === 'ArrowLeft' ? -1 : 1);
        if (j < 0 || j >= ids.length) return;
        const next = [...ids];
        [next[i], next[j]] = [next[j], next[i]];
        onOrder(next);
      },
    };
  };

  return { box, order: shown, dragged, item };
}
