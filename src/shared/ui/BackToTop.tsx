import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { scrollToTop } from '@/shared/lib/motion';
import { IconButton } from './IconButton';
import { Tooltip } from './Tooltip';

// A way back up a long page, showing as soon as `after` (whatever sits at
// the top, say the search) has scrolled out of sight above
export function BackToTop({
  after,
  className,
}: {
  after: Element | null;
  className?: string;
}) {
  const [far, setFar] = useState(false);

  useEffect(() => {
    if (!after) return;
    const observer = new IntersectionObserver(([entry]) =>
      setFar(!entry.isIntersecting && entry.boundingClientRect.top < 0),
    );
    observer.observe(after);
    return () => observer.disconnect();
  }, [after]);

  return (
    <Tooltip
      label='Back to top'
      side='left'
      className={cn(
        'fixed bottom-6 right-6 z-20 transition-[opacity,translate,bottom] duration-500 ease-soft sm:bottom-8 sm:right-8',
        // Over a bar floating at the foot of the screen, when there's one
        // (data-floating-bar)
        '[:root:has([data-floating-bar])_&]:bottom-24 sm:[:root:has([data-floating-bar])_&]:bottom-28',
        far ? 'opacity-100' : 'pointer-events-none translate-y-3 opacity-0',
        className,
      )}
    >
      <IconButton
        aria-label='Back to top'
        // Out of the way of the keyboard too while it's hidden
        tabIndex={far ? undefined : -1}
        aria-hidden={far ? undefined : true}
        onClick={scrollToTop}
        className='shadow-[0_10px_24px_-12px_rgba(40,28,14,0.45)]'
      >
        <ArrowUp size={16} />
      </IconButton>
    </Tooltip>
  );
}
