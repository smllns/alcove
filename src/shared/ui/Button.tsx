import type { ComponentProps } from 'react';
import { cn } from '@/shared/lib/cn';
import { ArrowIcon } from './ArrowIcon';
import { buttonClass, type ButtonVariant } from './buttonStyles';
import { Spinner } from './Spinner';

type ButtonProps = ComponentProps<'button'> & {
  variant?: ButtonVariant;
  arrow?: boolean;
  // Shows a spinner and blocks repeat clicks
  loading?: boolean;
};

export function Button({
  variant = 'primary',
  arrow = false,
  loading = false,
  type = 'button',
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonClass(variant, className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {children}
      {arrow ? (
        loading ? (
          <Spinner />
        ) : (
          <ArrowIcon size={variant === 'pill' ? 15 : 16} />
        )
      ) : (
        // Without an arrow to take the place of, the spinner opens a place
        // of its own, softly, and folds it away again (the space before it
        // too)
        <span
          aria-hidden
          className={cn(
            'grid transition-all duration-500 ease-soft',
            loading
              ? 'grid-cols-[1fr] opacity-100'
              : '-ms-(--gap) grid-cols-[0fr] opacity-0',
          )}
        >
          <span className='flex min-w-0 overflow-hidden'>
            <Spinner />
          </span>
        </span>
      )}
    </button>
  );
}
