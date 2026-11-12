import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';

// One row of the feed, whatever it tells: ruled off from the next, and lit
// softly when it's new since the feed was last looked at (`fresh`)
export function FeedEntry({
  fresh,
  className,
  children,
}: {
  fresh: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <article
      className={cn(
        'flex gap-3.5 border-b border-line/70 px-6',
        className,
        fresh && 'bg-accent/7',
      )}
    >
      {children}
    </article>
  );
}
