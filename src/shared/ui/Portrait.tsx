import { useState } from 'react';
import { cn } from '@/shared/lib/cn';
import { ZoomShowcase } from './ZoomShowcase';

// The first letters of a name's first and last words: "KV" (of an
// @username, its first letter)
const initials = (name: string) => {
  const words = name
    .replace(/^@/, '')
    .split(/[\s,.]+/)
    .filter(Boolean);
  return [words[0], words.length > 1 ? words.at(-1) : '']
    .map((word) => word?.[0] ?? '')
    .join('')
    .toUpperCase();
};

// Someone's photo (a writer's, a reader's), its corners rounded (`round`:
// a circle, as a reader is everywhere), a soft sheen on it
// as of light on a print. Their initials till it comes, or if it never
// does; the photo fading in once it's loaded, and then opening up to fill
// the screen, as a book's cover does (ZoomShowcase).
export function Portrait({
  name,
  url,
  round = false,
  className,
}: {
  name: string;
  url?: string;
  round?: boolean;
  className?: string;
}) {
  const [load, setLoad] = useState<'loading' | 'loaded' | 'failed'>('loading');
  const shown = url && load !== 'failed';
  const shape = round ? 'aspect-square' : 'aspect-4/5';
  const picture = (big: boolean) => (
    <div className={cn('relative', shape)}>
      <div
        className={cn(
          'cover-zoom relative grid size-full place-items-center overflow-hidden rounded-[26px] bg-line/40 font-serif text-5xl text-muted shadow-[0_24px_40px_-24px_rgb(var(--shade)/calc(0.7*var(--shade-k))),inset_0_0_0_1px_rgb(255_255_255/0.3)] lg:text-6xl',
          big && 'rounded-[32px]',
          // Small on a phone, its initials smaller too
          round && 'rounded-full max-lg:text-4xl',
        )}
      >
        <span aria-hidden>{initials(name)}</span>
        {shown && (
          <img
            src={url}
            alt=''
            onLoad={() => setLoad('loaded')}
            onError={() => setLoad('failed')}
            className={cn(
              'absolute inset-0 size-full object-cover transition-opacity duration-700 ease-soft',
              load === 'loaded' ? 'opacity-100' : 'opacity-0',
            )}
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
  return (
    <ZoomShowcase
      label='See the photo larger'
      bigLabel={`A photo of ${name}`}
      place={shape}
      bigClass='w-[min(84vw,64vh)]'
      ready={load === 'loaded'}
      // Its width (as wide as it's to be drawn)
      className={className}
      picture={picture}
    />
  );
}
