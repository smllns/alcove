import { Fragment, type ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';
import { softClass } from './buttonStyles';
import { capsuleClass } from './surfaces';
import { Tooltip } from './Tooltip';

// A small capsule of choices; the chosen one sits in a soft pill
export function ChoiceCapsule<T extends string>({
  label,
  options,
  current,
  onChange,
  tips = true,
  className,
}: {
  label: string;
  options: { value: T; label: string; icon: ReactNode; wide?: boolean }[];
  current: T;
  onChange: (value: T) => void;
  // Hover labels, for icons that need explaining
  tips?: boolean;
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
            aria-label={option.label}
            onClick={() => onChange(option.value)}
            className={softClass(
              on,
              cn(
                'grid h-8 min-w-8 place-items-center px-2 text-xs font-medium',
                option.wide && 'max-sm:hidden',
              ),
            )}
          >
            {option.icon}
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
