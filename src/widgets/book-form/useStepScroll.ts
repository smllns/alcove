import { useEffect, useRef } from 'react';
import { pageScrollY, scrollPageTo } from '@/shared/lib/pageScroll';
import type { Step } from './StepHeading';

// How far below the top of the screen a step's start is brought, clear of
// the tabs floating there
export const ROOM_ABOVE = 96;

// Each step starts from its heading (the ref returned). Once the new step
// is on screen, as the page may have changed height with it (on a phone
// the second step drops the cover choices); only if the heading is out of
// easy view. Changing a book, the steps are switched between at the
// heading or after being brought there (BookForm), so only a heading out
// of sight altogether is, e.g. when a problem on the other step sends the
// reader over to it.
export function useStepScroll(step: Step, editing: boolean) {
  const heading = useRef<HTMLDivElement>(null);
  // The step last scrolled to: only a change of step moves the page, not
  // the form's first showing (however many times that's run, as React's
  // strict mode does in development)
  const shown = useRef(step);
  useEffect(() => {
    if (shown.current === step) return;
    shown.current = step;
    const top = heading.current?.getBoundingClientRect().top;
    const inView =
      top !== undefined && top > 0 && top < innerHeight / (editing ? 1 : 3);
    if (top === undefined || inView) return;
    const el = heading.current;
    scrollPageTo(pageScrollY(el) + top - ROOM_ABOVE, 'smooth', el);
  }, [step, editing]);
  return heading;
}
