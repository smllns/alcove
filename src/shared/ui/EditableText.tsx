import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';

// Text that turns into a box to change it in when clicked (InlineEditor),
// with a text cursor to say so
export function EditableText({
  label,
  onEdit,
  className,
  children,
}: {
  // What it is, for screen readers: "Change your review"
  label: string;
  onEdit: () => void;
  className?: string;
  children: ReactNode;
}) {
  return (
    <button
      type='button'
      onClick={onEdit}
      aria-label={label}
      className={cn('block w-full cursor-text text-left', className)}
    >
      {children}
    </button>
  );
}
