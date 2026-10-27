import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';
import { choiceClass } from './buttonStyles';

// A pill turning something on and off (changing a home, arranging books),
// lit while on, saying so (`label`, as it is now)
export function ChoiceToggle({
  on,
  onChange,
  icon,
  label,
  compact = false,
}: {
  on: boolean;
  onChange: (on: boolean) => void;
  icon: ReactNode;
  label: string;
  // Just its icon on a phone
  compact?: boolean;
}) {
  return (
    <button
      type='button'
      aria-pressed={on}
      onClick={() => onChange(!on)}
      aria-label={compact ? label : undefined}
      className={cn(
        'inline-flex items-center gap-2',
        choiceClass(on),
        compact && 'max-sm:size-10 max-sm:justify-center max-sm:px-0',
      )}
    >
      {icon}
      <span className={cn(compact && 'max-sm:sr-only')}>{label}</span>
    </button>
  );
}
