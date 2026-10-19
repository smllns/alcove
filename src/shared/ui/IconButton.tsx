import type { ComponentProps } from 'react';
import { iconButtonClass } from './buttonStyles';

// Round, outlined button for a single icon. Always give it an aria-label.
export function IconButton({
  className,
  type = 'button',
  ...props
}: ComponentProps<'button'>) {
  return (
    <button type={type} className={iconButtonClass(className)} {...props} />
  );
}
