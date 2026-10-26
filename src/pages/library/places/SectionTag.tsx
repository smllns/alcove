import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';

// A letter in a ring, as a drawing tags what's drawn again in detail
export function SectionTag({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-grid size-[22px] shrink-0 place-items-center rounded-full border border-(--fine) text-[10px] tracking-normal text-ink',
        className,
      )}
    >
      {children}
    </span>
  );
}
