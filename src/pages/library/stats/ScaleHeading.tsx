import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';
import { labelClass } from '@/shared/ui/fieldStyles';

// What a drawing in a chapter counts, small on the left, and its sum on
// the right: "Books … 18 books · about 2 a month"
export function ScaleHeading({
  name,
  className,
  children,
}: {
  name: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn('flex items-baseline justify-between gap-3', className)}>
      <span className={labelClass}>{name}</span>
      <span className='font-serif text-[0.8125rem] text-ink-soft'>
        {children}
      </span>
    </div>
  );
}
