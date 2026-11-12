import { counted } from '@/shared/lib/plural';
import { ScaleHeading } from '@/shared/ui/ScaleHeading';
import type { readingYear } from './readingYears';
import { SpanTimeline } from './SpanTimeline';

// A year's books from start to finish (SpanTimeline) under its heading,
// with how long a book took; none begun and finished, nothing
export function YearSpans({
  found,
  year,
  className,
}: {
  found: ReturnType<typeof readingYear>;
  year: number;
  className?: string;
}) {
  if (!found.laid.length) return null;
  return (
    <div className={className}>
      <ScaleHeading name='Start to finish' className='mb-4'>
        {counted(found.average, 'day')} a book
      </ScaleHeading>
      <SpanTimeline found={found} year={year} />
    </div>
  );
}
