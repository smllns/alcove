import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';
import { textLinkClass } from '@/shared/ui/buttonStyles';
import { TransitionLink } from '@/shared/ui/TransitionLink';

// The way from a few of a reader's books to all of them, under the few
export function AllLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <TransitionLink
      to={to}
      className={cn('mt-8 inline-flex text-sm text-muted', textLinkClass)}
    >
      {children}
    </TransitionLink>
  );
}
