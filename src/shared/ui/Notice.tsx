import type { ReactNode } from 'react';
import { Button } from './Button';

// A question the form needs answered before it can go on, with the one
// button that answers it
export function Notice({
  title,
  children,
  action,
  onAction,
}: {
  title: ReactNode;
  children: ReactNode;
  action: string;
  onAction: () => void;
}) {
  return (
    <div
      role='alert'
      className='rounded-2xl border border-line bg-surface/70 px-5 py-4 text-sm'
    >
      <p className='text-ink'>{title}</p>
      <p className='mt-1 text-muted'>{children}</p>
      <Button variant='pill' className='mt-3' onClick={onAction}>
        {action}
      </Button>
    </div>
  );
}
