import { useEffect, useRef } from 'react';
import type { Step } from './StepHeading';

// Each step starts from its heading (the ref returned). Once the new step
// is on screen, as the page may have changed height with it (on a phone
// the second step drops the cover choices); only if the heading is out of
// easy view. Changing a book, it's back up to the very top, as it opened.
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
    if (top === undefined || (top > 0 && top < innerHeight / 3)) return;
    window.scrollTo({
      top: editing ? 0 : scrollY + top - 96,
      behavior: 'smooth',
    });
  }, [step, editing]);
  return heading;
}
