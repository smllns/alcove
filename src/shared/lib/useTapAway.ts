import { useEffect, useRef, type RefObject } from 'react';

// While `on`, a press anywhere but on what `inside` holds (a field and
// what it opened, say) calls `onAway`: the way a menu or what a search
// found is let go by a tap somewhere else
export function useTapAway(
  on: boolean,
  inside: RefObject<HTMLElement | null>[],
  onAway: () => void,
) {
  // The latest of each, without listening afresh as they change
  const latest = useRef({ inside, onAway });
  useEffect(() => {
    latest.current = { inside, onAway };
  });
  useEffect(() => {
    if (!on) return;
    const down = (e: PointerEvent) => {
      const target = e.target as Node;
      if (!latest.current.inside.some((el) => el.current?.contains(target)))
        latest.current.onAway();
    };
    document.addEventListener('pointerdown', down);
    return () => document.removeEventListener('pointerdown', down);
  }, [on]);
}
