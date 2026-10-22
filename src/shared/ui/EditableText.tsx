import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';
import { useFolding } from './folding';

// Text that turns into a box to change it in when clicked (InlineEditor),
// with a text cursor to say so. Within long text that folds (Fold), a
// click opens and folds that instead, and changing it is left to a button
// of its own beside it.
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
  if (useFolding()) return <div className={className}>{children}</div>;
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
