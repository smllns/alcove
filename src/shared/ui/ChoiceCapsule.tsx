import { Fragment, type ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';
import { softClass } from './buttonStyles';
import { capsuleClass } from './surfaces';
import { Tooltip } from './Tooltip';

// A small capsule of choices; the chosen one sits in a soft pill. Each
// is its icon, explained as it's hovered (`tips`), or said beside it
// (`words`)
export function ChoiceCapsule<T extends string>({
  label,
  options,
  current,
  onChange,
  tips = true,
  words = false,
  className,
}: {
  label: string;
  options: { value: T; label: string; icon: ReactNode; wide?: boolean }[];
  current: T;
  onChange: (value: T) => void;
  // Hover labels, for icons that need explaining
  tips?: boolean;
  words?: boolean;
  className?: string;
}) {
  return (
    <div
      role='radiogroup'
      aria-label={label}
      className={cn('flex animate-rise', capsuleClass, className)}
    >
      {options.map((option) => {
        const on = option.value === current;
        const button = (
          <button
            type='button'
            role='radio'
            aria-checked={on}
            aria-label={words ? undefined : option.label}
            onClick={() => onChange(option.value)}
            className={softClass(
              on,
              cn(
                'h-8 min-w-8 text-xs font-medium',
                words
                  ? 'flex items-center gap-1.5 px-3'
                  : 'grid place-items-center px-2',
                option.wide && 'max-sm:hidden',
              ),
            )}
          >
            {option.icon}
            {words && option.label}
          </button>
        );
        return tips ? (
          <Tooltip key={option.value} label={option.label} side='bottom'>
            {button}
          </Tooltip>
        ) : (
          <Fragment key={option.value}>{button}</Fragment>
        );
      })}
    </div>
  );
}
