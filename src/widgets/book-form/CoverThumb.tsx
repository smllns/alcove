import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';

// The size and lift every cover thumbnail shares
export const thumb =
  'w-11 shrink-0 cursor-pointer rounded-[3px] ring-offset-2 ring-offset-(--bg-mid) transition-all duration-500 ease-soft hover:-translate-y-0.5';

// A small square-ish button among the cover thumbnails
export function ThumbButton({
  label,
  chosen = false,
  dashed = false,
  onClick,
  children,
}: {
  label: string;
  chosen?: boolean;
  dashed?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type='button'
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cn(
        thumb,
        'grid aspect-2/3 place-items-center border border-line text-muted hover:border-ink hover:text-ink',
        dashed && 'border-dashed',
        chosen && 'ring-2 ring-ink',
      )}
    >
      {children}
    </button>
  );
}
