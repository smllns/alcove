import { useId, type ComponentProps, type ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';
import { FieldNote } from './FieldNote';
import { labelClass } from './fieldStyles';

type TextAreaProps = ComponentProps<'textarea'> & {
  label: string;
  error?: string;
  // Quiet helper text, replaced by the error when there is one
  hint?: string;
  // Rendered beside the label, on the right (e.g. a remove button)
  action?: ReactNode;
};

// TextField's multi-line sibling; grows with what's typed
export function TextArea({
  label,
  error,
  hint,
  action,
  className,
  ...props
}: TextAreaProps) {
  const id = useId();
  const noteId = `${id}-note`;
  const described = Boolean(error ?? hint);

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div className='flex items-center justify-between gap-3'>
        <label htmlFor={id} className={labelClass}>
          {label}
        </label>
        {action}
      </div>
      <textarea
        id={id}
        rows={3}
        aria-invalid={error ? true : undefined}
        aria-describedby={described ? noteId : undefined}
        className={cn(
          'field-sizing-content min-h-18 resize-none border-b bg-transparent py-2 text-base leading-relaxed text-ink outline-none transition-colors duration-500 ease-soft placeholder:text-faint focus:border-ink',
          error ? 'border-danger' : 'border-line',
        )}
        {...props}
      />
      <FieldNote id={noteId} error={error} hint={hint} />
    </div>
  );
}
