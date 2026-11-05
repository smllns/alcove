import { cn } from '@/shared/lib/cn';
import { useLingering } from '@/shared/lib/useLingering';
import { Spinner } from '@/shared/ui/Spinner';

// How long the spinner takes to fade out (duration-500 below)
const FADE_MS = 500;

// A quiet spinner in the middle of the sky, below the tabs (`insetTop`),
// while its books are still coming in; once they're all in (`ready`), it
// fades out and is then let go, not to turn on unseen
export function SkyLoading({
  ready,
  insetTop,
}: {
  ready: boolean;
  insetTop: number;
}) {
  const spinning = useLingering(!ready, FADE_MS);
  return (
    <div
      role={ready ? undefined : 'status'}
      aria-label={ready ? undefined : 'Loading'}
      className={cn(
        'pointer-events-none absolute inset-x-0 bottom-0 z-2 flex items-center justify-center text-muted',
        'transition-opacity duration-500 ease-in-out',
        ready ? 'opacity-0' : 'opacity-100',
      )}
      style={{ top: insetTop }}
    >
      {spinning && <Spinner />}
    </div>
  );
}
