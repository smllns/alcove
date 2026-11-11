import { cn } from '@/shared/lib/cn';
import type { RulerSpan } from './writerBooks';

// The line itself, along the bottom: a mark every ten years (twenty for a
// long one) and the years they were born and died, named
export function LifeRuler({
  span,
  x,
  under,
}: {
  span: RulerSpan;
  // Where a year is along it
  x: (year: number) => number;
  // How far up from the bottom it runs
  under: number;
}) {
  const step = span.to - span.from > 70 ? 20 : 10;
  const marks: number[] = [];
  for (
    let year = Math.ceil(span.from / step) * step;
    year <= span.to;
    year += step
  )
    marks.push(year);
  // Not one so close to a named year that their numbers would touch
  const named = [span.born, span.died].filter((year) => year !== undefined);
  const plain = marks.filter((year) =>
    named.every((each) => Math.abs(x(each) - x(year)) > 44),
  );
  return (
    <li aria-hidden className='absolute inset-x-0' style={{ bottom: under }}>
      <span className='absolute inset-x-0 top-0 h-px bg-ink-soft/70' />
      {plain.map((year) => (
        <Mark key={year} at={x(year)} label={String(year)} />
      ))}
      {span.born && (
        <Mark at={x(span.born)} label={`born ${span.born}`} strong />
      )}
      {span.died && (
        <Mark at={x(span.died)} label={`died ${span.died}`} strong />
      )}
    </li>
  );
}

function Mark({
  at,
  label,
  strong = false,
}: {
  at: number;
  label: string;
  strong?: boolean;
}) {
  return (
    <span
      className='absolute top-0 flex -translate-x-1/2 flex-col items-center'
      style={{ left: at }}
    >
      <span className={cn('w-px bg-ink-soft/70', strong ? 'h-2.5' : 'h-1.5')} />
      <span
        className={cn(
          'mt-1 whitespace-nowrap text-xs tabular-nums',
          strong ? 'text-ink-soft' : 'text-faint',
        )}
      >
        {label}
      </span>
    </span>
  );
}
