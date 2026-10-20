import { cn } from '@/shared/lib/cn';
import { Spinner } from './Spinner';

// A spinner in the middle of where something is about to appear
export function Loading({ className }: { className?: string }) {
  return (
    <div
      role='status'
      aria-label='Loading'
      className={cn('flex justify-center py-10 text-muted', className)}
    >
      <Spinner />
    </div>
  );
}
