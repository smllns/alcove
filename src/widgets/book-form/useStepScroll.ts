import { useEffect, useRef } from 'react';
import { pageScrollY, scrollPageTo } from '@/shared/lib/pageScroll';
import { softSwitchAt } from '@/shared/lib/softSwitch';
import type { Step } from './StepHeading';

// How far below the top of the screen a step's start is brought, clear of
// the tabs floating there
const ROOM_ABOVE = 96;

// Each step starts from its heading (`heading`). Once the new step
// is on screen, as the page may have changed height with it (on a phone
// the second step drops the cover choices); only if the heading is out of
// easy view. Changing a book, the steps are switched between at the
// heading or after being brought there (`switchFromBelow`), so only a
// heading out of sight altogether is, e.g. when a problem on the other step
// sends the reader over to it. `form`: for the form's own element.
export function useStepScroll(
  step: Step,
  editing: boolean,
  setStep: (step: Step) => void,
) {
  const heading = useRef<HTMLDivElement>(null);
  const form = useRef<HTMLFormElement>(null);
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

  // Changing a book, over to the other step from the buttons below it: up
  // to where that step starts first, the book's from its cover, the copy's
  // from the tabs; and kept there as the step changes, though what's above
  // may change with it (on a phone, the copy has no cover choices)
  const switchFromBelow = (next: Step) => {
    const startOf = () => {
      const start = next === 'book' ? form.current : heading.current;
      if (!start) return 0;
      return Math.max(
        0,
        pageScrollY(start) + start.getBoundingClientRect().top - ROOM_ABOVE,
      );
    };
    softSwitchAt(
      startOf(),
      () => setStep(next),
      () => scrollPageTo(startOf()),
    );
  };
  return { heading, form, switchFromBelow };
}
