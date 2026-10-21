import { cn } from '@/shared/lib/cn';
import { halves } from '@/shared/lib/halves';
import { GoldStar } from './Stars';

// A rating as it's shown beside a book: a star and the number out of
// five, "★ 4½/5"
export function Rating({
  value,
  className,
}: {
  // 0.5 to 5 in halves
  value: number;
  className?: string;
}) {
  return (
    <span
      role='img'
      aria-label={`${halves(value)} out of 5 stars`}
      className={cn(
        'inline-flex items-center gap-0.5 text-ink-soft',
        className,
      )}
    >
      <GoldStar size={14} strokeWidth={1.5} className='size-[0.95em]' />
      <span>
        {halves(value)}
        <span className='text-faint'>/5</span>
      </span>
    </span>
  );
}
