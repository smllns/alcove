import { counted } from '@/shared/lib/plural';
import { labelClass } from '@/shared/ui/fieldStyles';
import { RatingFigure } from '@/shared/ui/Rating';
import { Stars } from '@/shared/ui/Stars';

// How readers at large rate a book: small stars, the average out of five,
// and how many rated it when that's known (and how many of them on alcove)
export function ReadersRating({
  label,
  average,
  count,
  alcove = 0,
}: {
  label: string;
  average: number;
  count?: number;
  alcove?: number;
}) {
  const here = alcove ? ` · ${alcove.toLocaleString('en')} on alcove` : '';
  const ratings =
    count === undefined ? '' : `, from ${counted(count, 'rating')}${here}`;
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
          <span className='text-sm text-muted'>
            {counted(count, 'rating')}
            {here}
          </span>
        )}
      </div>
    </div>
  );
}
