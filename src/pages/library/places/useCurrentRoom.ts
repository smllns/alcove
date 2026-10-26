import { useEffect, type RefObject } from 'react';

// With no mouse to point at a room, the room in the middle of the screen
// is the one looked at, and its lamp comes on as if pointed at
// (data-current, styles/places.css), the next one taking over as the
// page scrolls: looked for once a frame while it does, by what's under
// the middle of the screen. Set on the room itself, so nothing else is
// drawn again. `rooms`: what's laid out, to look again when it changes.
export function useCurrentRoom(
  house: RefObject<HTMLElement | null>,
  rooms: unknown,
) {
  useEffect(() => {
    const target = house.current;
    if (!target || !window.matchMedia('(hover: none)').matches) return;
    let current: Element | null = null;
    let frame = 0;
    const look = () => {
      frame = 0;
      const room = document
        .elementFromPoint(innerWidth / 2, innerHeight / 2)
        ?.closest('.house-room');
      const found = room && target.contains(room) ? room : null;
      if (found === current) return;
      current?.removeAttribute('data-current');
      found?.setAttribute('data-current', '');
      current = found;
    };
    const onScroll = () => {
      frame ||= requestAnimationFrame(look);
    };
    look();
    // Pages scroll in a box of their own, whose scrolling doesn't bubble:
    // heard on its way down instead
    document.addEventListener('scroll', onScroll, {
      capture: true,
      passive: true,
    });
    return () => {
      document.removeEventListener('scroll', onScroll, { capture: true });
      cancelAnimationFrame(frame);
      current?.removeAttribute('data-current');
    };
  }, [house, rooms]);
}
