import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';

// Smoothly opens and closes to its content's natural height. Closed content
// is inert, so it can't be tabbed into.
export function Collapse({
  open,
  children,
}: {
  open: boolean;
  children: ReactNode;
}) {
  return (
    <div
      inert={!open}
      className={cn(
        'grid transition-all duration-700 ease-soft',
        open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
      )}
    >
      <div className='min-h-0 overflow-hidden'>{children}</div>
    </div>
  );
}
