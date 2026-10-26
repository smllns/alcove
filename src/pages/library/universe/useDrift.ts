import { useEffect, type RefObject } from 'react';
import { reducedMotionNow } from '@/shared/lib/motion';
import { stillWhileTurning } from '@/shared/lib/stillWhileTurning';
import type { SkyStar } from './layout';

// A book wandering slowly about its place: round a little loop through two
// points, rather than back and forth, swaying a touch as it goes, each
// book at its own pace and from its own point in the loop. Animated with
// the numbers themselves rather than by a CSS animation reading them from
// variables: the browser can then move every book on its own, off the
// page's main work (Safari wouldn't otherwise), so a sky full of them
// costs it nothing between frames. Not at all for a reader who'd rather
// things stayed still.
export function useDrift(
  element: RefObject<HTMLElement | null>,
  { driftX: x, driftY: y, sway, driftSeconds, phase }: SkyStar,
) {
  useEffect(() => {
    const target = element.current;
    if (!target || reducedMotionNow()) return;
    const still = 'translate(0px, 0px) rotate(0deg)';
    const drift = target.animate(
      [
        { offset: 0, transform: still, easing: 'ease-in-out' },
        {
          offset: 0.33,
          transform: `translate(${x}px, ${y}px) rotate(${sway}deg)`,
          easing: 'ease-in-out',
        },
        {
          offset: 0.66,
          transform: `translate(${-0.7 * y}px, ${0.7 * x}px) rotate(${-sway}deg)`,
          easing: 'ease-in-out',
        },
        { offset: 1, transform: still },
      ],
      {
        duration: driftSeconds * 1000,
        // Its own point in the loop, as if it had been wandering all along
        delay: phase * 1000,
        iterations: Infinity,
      },
    );
    // Still while a page turns, so the books land where they're drawn
    const letGo = stillWhileTurning(drift);
    return () => {
      letGo();
      drift.cancel();
    };
  }, [element, x, y, sway, driftSeconds, phase]);
}
