import { cn } from '@/shared/lib/cn';
import { captionClass } from '@/shared/ui/fieldStyles';
import { IconDot } from '@/shared/ui/IconDot';
import { dayName } from './copyLines';
import type { Moment } from './copyMoments';

// How much a word more stands out: a loan due back soon in amber, a late
// one in red
const urgencies: Record<NonNullable<Moment['more']>['urgency'], string> = {
  late: 'text-danger',
  soon: 'text-(--reading)',
  calm: 'text-ink-soft',
};

// A copy's story (copyMoments) as a line of moments, each hung on a thread
export function CopyStory({ moments }: { moments: Moment[] }) {
  return (
    <ol className='relative'>
      {/* The thread the moments hang on */}
      <span
        aria-hidden
        className='absolute bottom-4 left-[17.5px] top-4 w-px bg-line'
      />
      {moments.map(({ day, icon, what, more }, i) => (
        <li key={i} className='relative flex gap-4 pb-5 last:pb-0'>
          <IconDot icon={icon} />
          <div className='min-w-0 pt-0.5'>
            <p className={captionClass}>
              {day ? dayName(day) : 'Some time ago'}
            </p>
            <p className='mt-1 font-serif text-[16px] leading-snug text-ink'>
              {what}
            </p>
            {more && (
              <p
                className={cn(
                  'mt-0.5 text-[13px] font-medium',
                  urgencies[more.urgency],
                )}
              >
                {more.text}
              </p>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
