import { useEffect, useState, type ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';

// How long opening and closing take, for anyone waiting on it to finish
export const COLLAPSE_MS = 700;

// Smoothly opens and closes to its content's natural height. Closed content
// is inert, so it can't be tabbed into. With `appear`, it opens on mount
// instead of starting open, so a newly added item grows into place. Only
// while it moves is its content cut to its edges: once open and still,
// what reaches out (a button on a corner, a tooltip) shows whole.
export function Collapse({
  open,
  appear = false,
  children,
}: {
  open: boolean;
  appear?: boolean;
  children: ReactNode;
}) {
  const [entered, setEntered] = useState(!appear);
  useEffect(() => {
    if (entered) return;
    // Two frames: one to paint it closed, the next to start opening
    let frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => setEntered(true));
    });
    return () => cancelAnimationFrame(frame);
  }, [entered]);
  const shown = open && entered;
  // Open and done opening
  const [settled, setSettled] = useState(shown);
  if (settled && !shown) setSettled(false);

  return (
    <div
      // Out of reach once closing or closed; opening, already in reach, so
      // what appears can take the cursor at once
      inert={!open}
      style={{ transitionDuration: `${COLLAPSE_MS}ms` }}
      onTransitionEnd={(e) => {
        if (e.target === e.currentTarget && shown) setSettled(true);
      }}
      className={cn(
        'grid transition-all ease-soft',
        shown ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
      )}
    >
      <div className={cn('min-h-0', !settled && 'overflow-hidden')}>
        {children}
      </div>
    </div>
  );
}
