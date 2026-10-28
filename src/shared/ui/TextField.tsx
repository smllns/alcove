import { useId, type ComponentProps, type ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';
import { FieldNote } from './FieldNote';
import { labelClass } from './fieldStyles';

type TextFieldProps = ComponentProps<'input'> & {
  label: string;
  error?: string;
  // Quiet helper text, replaced by the error when there is one
  hint?: string;
  // Rendered inside the field, on the right (e.g. a show-password button)
  trailing?: ReactNode;
  // Shows a small * after the label, where most fields around are optional
  marked?: boolean;
  // Only for screen readers, where what it is is plain beside it already
  labelHidden?: boolean;
};

// Underlined input with a small caps label, in the editorial style of the site
export function TextField({
  label,
  error,
  hint,
  trailing,
  marked,
  labelHidden,
  className,
  ...props
}: TextFieldProps) {
  const id = useId();
  const noteId = `${id}-note`;
  const described = Boolean(error ?? hint);

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <label htmlFor={id} className={labelHidden ? 'sr-only' : labelClass}>
        {label}
        {marked && (
          <span
            aria-hidden
            className='ml-1 align-[-0.15em] text-[14px] leading-none text-danger'
          >
            *
          </span>
        )}
      </label>
      <div
        className={cn(
          'flex items-center border-b transition-colors duration-500 ease-soft focus-within:border-ink',
          error ? 'border-danger' : 'border-line',
        )}
      >
        <input
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={described ? noteId : undefined}
          className='min-w-0 flex-1 bg-transparent py-2 text-base sm:py-2.5 text-ink outline-none placeholder:text-faint'
          {...props}
        />
        {trailing}
      </div>
      <FieldNote id={noteId} error={error} hint={hint} />
    </div>
  );
}
