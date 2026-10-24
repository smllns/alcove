import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';
import { labelClass } from '@/shared/ui/fieldStyles';

// A part of a section of the book's page under a small label of its own:
// "Yours", "On the same themes"
export function Labelled({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className={cn('mb-4', labelClass)}>{label}</p>
      {children}
    </div>
  );
}
