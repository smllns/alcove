import type { ComponentProps } from 'react';
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
      {loading ? (
        <Spinner />
      ) : (
        arrow && <ArrowIcon size={variant === 'pill' ? 15 : 16} />
      )}
    </button>
  );
}
