import { useId, type CSSProperties } from 'react';
import { cn } from '@/shared/lib/cn';
import { choiceClass, toneChoiceClass } from './buttonStyles';
import { labelClass } from './fieldStyles';

type ChoicesProps<T extends string> = {
  label: string;
  // `tone`: a colour of its own, as a CSS colour
  options: { value: T; label: string; tone?: string }[];
  value: T | '';
  onChange: (value: T | '') => void;
  // Picking the chosen one again clears it, for optional answers
  clearable?: boolean;
};

// A row of pills, one of which can be chosen (a radio group underneath)
export function Choices<T extends string>({
  label,
  options,
  value,
  onChange,
  clearable,
}: ChoicesProps<T>) {
  const name = useId();
  return (
    <fieldset className='flex flex-col gap-3'>
      <legend className={cn('mb-3', labelClass)}>{label}</legend>
      <div className='flex flex-wrap gap-2'>
        {options.map((option) => {
          const chosen = option.value === value;
          return (
            <label
              key={option.value}
              className={cn(
                option.tone ? toneChoiceClass(chosen) : choiceClass(chosen),
                'has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ink',
              )}
              style={
                option.tone
                  ? ({ '--tone': option.tone } as CSSProperties)
                  : undefined
              }
            >
              <input
                type='radio'
                name={name}
                value={option.value}
                checked={chosen}
                onChange={() => onChange(option.value)}
                onClick={() => clearable && chosen && onChange('')}
                className='sr-only'
              />
              {option.tone && (
                <span
                  aria-hidden
                  className={cn(
                    'size-2 rounded-full transition-colors duration-500 ease-soft',
                    chosen ? 'bg-button-text/85' : 'bg-(--tone)',
                  )}
                />
              )}
              {option.label}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
