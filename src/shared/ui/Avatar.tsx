import { cn } from '@/shared/lib/cn';
import { RoundPhoto } from './RoundPhoto';

const sizes = {
  sm: 'size-8 text-[0.9375rem]',
  lg: 'size-16 text-[1.75rem]',
};

// A reader as a round tile in a softened ink, the first letter of their
// name (or @username) on it in the colour of the paper; their photo over
// it, if they've one, fading in as it comes
export function Avatar({
  name,
  url,
  size = 'sm',
  className,
}: {
  name: string;
  url?: string | null;
  size?: keyof typeof sizes;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        'relative grid shrink-0 select-none place-items-center overflow-hidden rounded-full bg-ink-soft font-serif font-semibold text-surface',
        sizes[size],
        className,
      )}
    >
      {name.replace(/^@/, '').trim().charAt(0).toUpperCase() || '·'}
      {url && (
        // Its own key, so another photo fades in afresh
        <RoundPhoto
          key={url}
          url={url}
          className='absolute inset-0 size-full'
        />
      )}
    </span>
  );
}
