import type { ComponentProps } from 'react';
import { ArrowIcon, BackArrowIcon } from './ArrowIcon';
import { buttonClass, type ButtonVariant } from './buttonStyles';
import { TransitionLink } from './TransitionLink';

type ButtonLinkProps = ComponentProps<typeof TransitionLink> & {
  variant?: ButtonVariant;
  // Trailing ↗
  arrow?: boolean;
  // Leading ←
  back?: boolean;
};

// A router link dressed as a button; page changes are animated
export function ButtonLink({
  variant = 'primary',
  arrow = false,
  back = false,
  className,
  children,
  ...props
}: ButtonLinkProps) {
  return (
    <TransitionLink className={buttonClass(variant, className)} {...props}>
      {back && <BackArrowIcon />}
      {children}
      {arrow && <ArrowIcon size={variant === 'pill' ? 15 : 16} />}
    </TransitionLink>
  );
}
