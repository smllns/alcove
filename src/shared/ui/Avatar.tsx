import { cn } from '@/shared/lib/cn';

const sizes = {
  sm: 'size-8 text-[15px]',
  lg: 'size-16 text-[28px]',
};

// A reader as a round tile in a softened ink, the first letter of their
// name (or @username) on it in the colour of the paper
export function Avatar({
  name,
  size = 'sm',
  className,
}: {
  name: string;
  size?: keyof typeof sizes;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        'grid shrink-0 select-none place-items-center rounded-full bg-ink-soft font-serif font-semibold text-surface',
        sizes[size],
        className,
      )}
    >
      {name.replace(/^@/, '').trim().charAt(0).toUpperCase() || '·'}
    </span>
  );
}
