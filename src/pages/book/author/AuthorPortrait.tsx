import { useState } from 'react';
import { cn } from '@/shared/lib/cn';

// The first letters of a name's first and last words: "KV"
const initials = (name: string) => {
  const words = name.split(/[\s,.]+/).filter(Boolean);
  return [words[0], words.length > 1 ? words.at(-1) : '']
    .map((word) => word?.[0] ?? '')
    .join('')
    .toUpperCase();
};

// A writer's photo, its corners rounded, a soft sheen on it as of light on
// a print. Their initials till it comes, or if it never does; the photo
// fading in once it's loaded.
export function AuthorPortrait({
  name,
  url,
  className,
}: {
  name: string;
  url?: string;
  className?: string;
}) {
  const [load, setLoad] = useState<'loading' | 'loaded' | 'failed'>('loading');
  const shown = url && load !== 'failed';
  const fade = cn(
    'transition-opacity duration-700 ease-soft',
    load === 'loaded' ? 'opacity-100' : 'opacity-0',
  );
  return (
    <div className={cn('relative aspect-4/5', className)}>
      <div className='relative grid size-full place-items-center overflow-hidden rounded-[26px] bg-line/40 font-serif text-5xl text-muted shadow-[0_24px_40px_-24px_rgb(var(--shade)/calc(0.7*var(--shade-k))),inset_0_0_0_1px_rgb(255_255_255/0.3)] lg:text-6xl'>
        <span aria-hidden>{initials(name)}</span>
        {shown && (
          <img
            src={url}
            alt=''
            onLoad={() => setLoad('loaded')}
            onError={() => setLoad('failed')}
            className={cn('absolute inset-0 size-full object-cover', fade)}
          />
        )}
        {/* A soft sheen from the top left, as of light on a print */}
        <span
          aria-hidden
          className='pointer-events-none absolute inset-0 bg-[linear-gradient(160deg,rgb(255_255_255/0.28),transparent_40%)] mix-blend-soft-light'
        />
      </div>
    </div>
  );
}
