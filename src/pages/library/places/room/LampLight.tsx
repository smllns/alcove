import { useEffect, useState, type CSSProperties, type RefObject } from 'react';

type Reach = { x: number; y: number; below: number };

// Where the lamp's bulb is in the room opened, from the room's corner, and
// how far past the room's foot the page goes on: to its end, or to the
// foot of the screen if it ends sooner. The page's own content, not the
// light, says where it ends, so the light never makes the page longer.
const reachOf = (room: HTMLElement): Reach | null => {
  const bulb = room.querySelector('.lamp-bulb')?.getBoundingClientRect();
  const page = room.closest('[data-page-scroll]');
  if (!bulb || !page) return null;
  const box = room.getBoundingClientRect();
  const end = Math.max(
    page.getBoundingClientRect().bottom,
    page.lastElementChild?.getBoundingClientRect().bottom ?? 0,
  );
  return {
    x: bulb.left + bulb.width / 2 - box.left,
    y: bulb.top + bulb.height / 2 - box.top,
    below: Math.max(0, end - box.bottom),
  };
};

// The light of a room's own lamp, opened: from its bulb out in every
// direction, nothing but the screen's edges stopping it
// (styles/room.css). Measured again as the room or the screen changes
// size.
export function LampLight({ room }: { room: RefObject<HTMLElement | null> }) {
  const [reach, setReach] = useState<Reach | null>(null);
  useEffect(() => {
    const target = room.current;
    const page = target?.closest('[data-page-scroll]');
    if (!target || !page) return;
    const observer = new ResizeObserver(() => setReach(reachOf(target)));
    observer.observe(target);
    observer.observe(page);
    return () => observer.disconnect();
  }, [room]);
  if (!reach) return null;
  return (
    <span
      aria-hidden
      className='lamp-light'
      style={
        {
          '--x': `${reach.x}px`,
          '--y': `${reach.y}px`,
          bottom: -reach.below,
        } as CSSProperties
      }
    />
  );
}
