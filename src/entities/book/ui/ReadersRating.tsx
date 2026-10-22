import { counted } from '@/shared/lib/plural';
import { labelClass } from '@/shared/ui/fieldStyles';
import { RatingFigure } from '@/shared/ui/Rating';
import { Stars } from '@/shared/ui/Stars';

// How readers at large rate a book: small stars, the average out of five,
// and how many rated it when that's known
export function ReadersRating({
  label,
  average,
  count,
}: {
  label: string;
  average: number;
  count?: number;
}) {
  const ratings =
    count === undefined ? '' : `, from ${counted(count, 'rating')}`;
  return (
    <div
      role='img'
      aria-label={`${label}: ${average} out of 5${ratings}`}
      className='flex flex-col gap-3'
    >
      <span className={labelClass}>{label}</span>
      {/* As tall as the reader's own stars, so the two can line up */}
      <div className='flex h-7 items-center gap-3'>
        <Stars value={average} size={18} />
        <RatingFigure>{average.toFixed(1)}</RatingFigure>
        {count !== undefined && (
          <span className='text-sm text-muted'>{counted(count, 'rating')}</span>
        )}
      </div>
    </div>
  );
}
