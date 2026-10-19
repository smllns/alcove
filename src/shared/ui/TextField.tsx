import { useId, type ComponentProps, type ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';

type TextFieldProps = ComponentProps<'input'> & {
  label: string;
  error?: string;
  // Quiet helper text, replaced by the error when there is one
  hint?: string;
  // Rendered inside the field, on the right (e.g. a show-password button)
  trailing?: ReactNode;
};

// Underlined input with a small caps label, in the editorial style of the site
export function TextField({
  label,
  error,
  hint,
  trailing,
  className,
  ...props
}: TextFieldProps) {
  const id = useId();
  const noteId = `${id}-note`;
  const note = error ?? hint;

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <label
        htmlFor={id}
        className='text-[10px] uppercase tracking-[0.24em] text-muted'
      >
        {label}
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
          aria-describedby={note ? noteId : undefined}
          className='min-w-0 flex-1 bg-transparent py-2 text-base sm:py-2.5 text-ink outline-none placeholder:text-faint'
          {...props}
        />
        {trailing}
      </div>
      {note && (
        <p
          id={noteId}
          className={cn('text-xs', error ? 'text-danger' : 'text-faint')}
        >
          {note}
        </p>
      )}
    </div>
  );
}
