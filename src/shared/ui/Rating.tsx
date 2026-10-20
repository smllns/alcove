import { Star } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { halves } from '@/shared/lib/halves';

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
      <Star aria-hidden className='size-[0.9em] fill-accent text-accent' />
      <span>
        {halves(value)}
        <span className='text-faint'>/5</span>
      </span>
    </span>
  );
}
