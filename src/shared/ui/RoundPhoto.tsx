import { useState } from 'react';
import { cn } from '@/shared/lib/cn';

// A photograph, round, fading in once it's loaded; one that won't load
// isn't there at all, leaving whatever's behind it (an initial, the years)
export function RoundPhoto({
  url,
  lazy = false,
  className,
}: {
  url: string;
  lazy?: boolean;
  // Its size and place
  className?: string;
}) {
  const [state, setState] = useState<'loading' | 'loaded' | 'failed'>(
    'loading',
  );
  if (state === 'failed') return null;
  return (
    <img
      src={url}
      alt=''
      loading={lazy ? 'lazy' : undefined}
      onLoad={() => setState('loaded')}
      onError={() => setState('failed')}
      className={cn(
        'rounded-full object-cover transition-opacity duration-500 ease-soft',
        state === 'loaded' ? 'opacity-100' : 'opacity-0',
        className,
      )}
    />
  );
}
