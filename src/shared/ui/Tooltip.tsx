import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';

// Where it sits, and the little slide it makes into place
const sides = {
  top: 'bottom-full left-1/2 mb-2 -translate-x-1/2 translate-y-1 group-hover/tip:translate-y-0 group-has-focus-visible/tip:translate-y-0',
  bottom:
    'top-full left-1/2 mt-2 -translate-x-1/2 -translate-y-1 group-hover/tip:translate-y-0 group-has-focus-visible/tip:translate-y-0',
  left: 'right-full top-1/2 mr-2.5 -translate-y-1/2 translate-x-1 group-hover/tip:translate-x-0 group-has-focus-visible/tip:translate-x-0',
};

// A short label for an icon button, shown after a moment's hover or when
// it's reached with the keyboard. Purely visual: the button carries its own
// aria-label.
export function Tooltip({
  label,
  side = 'top',
  className,
  children,
}: {
  label: string;
  side?: keyof typeof sides;
  className?: string;
  children: ReactNode;
}) {
  return (
    // `className` may position it (absolute in a corner, say), so the
    // tooltip's own anchor is the inner span
    <span className={cn('inline-flex', className)}>
      <span className='group/tip relative inline-flex'>
        {children}
        <span
          aria-hidden
          className={cn(
            'pointer-events-none absolute z-50 whitespace-nowrap rounded-full bg-button px-3 py-1.5 text-xs text-button-text opacity-0 shadow-[0_8px_20px_-10px_rgba(40,28,14,0.6)] transition-all duration-300 ease-soft',
            // Shown after a short pause, gone at once
            'group-hover/tip:opacity-100 group-hover/tip:delay-300 group-has-focus-visible/tip:opacity-100',
            sides[side],
          )}
        >
          {label}
        </span>
      </span>
    </span>
  );
}
