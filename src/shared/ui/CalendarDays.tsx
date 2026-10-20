import type { KeyboardEvent, RefObject } from 'react';
import { cn } from '@/shared/lib/cn';
import { monthGrid, toDay, today, weekdays } from '@/shared/lib/dates';

// The month around the focused day, Monday first: the chosen day filled,
// today ringed, days of the months either side faint. Only the focused
// day is in the tab order; the arrow keys move it. Days before `earliest`
// or after `latest` can't be picked.
export function CalendarDays({
  gridRef,
  focus,
  value,
  earliest,
  latest,
  onKeyDown,
  onPick,
}: {
  gridRef: RefObject<HTMLDivElement | null>;
  focus: Date;
  value: string;
  earliest?: string;
  latest?: string;
  onKeyDown: (e: KeyboardEvent) => void;
  onPick: (day: string) => void;
}) {
  const now = today();
  const focusDay = toDay(focus);
  return (
    <div ref={gridRef} role='grid' onKeyDown={onKeyDown}>
      <div className='grid grid-cols-7 pb-1' role='row'>
        {weekdays.map((name) => (
          <span
            key={name}
            role='columnheader'
            className='py-1 text-center text-[11px] uppercase tracking-[0.12em] text-faint'
          >
            {name}
          </span>
        ))}
      </div>
      <div className='grid grid-cols-7 gap-y-0.5'>
        {monthGrid(focus.getFullYear(), focus.getMonth()).map((date) => {
          const day = toDay(date);
          const inMonth = date.getMonth() === focus.getMonth();
          const chosen = day === value;
          const outside = Boolean(
            (latest && day > latest) || (earliest && day < earliest),
          );
          return (
            <button
              key={day}
              type='button'
              role='gridcell'
              data-day={day}
              tabIndex={day === focusDay ? 0 : -1}
              aria-selected={chosen}
              aria-label={date.toDateString()}
              disabled={outside}
              onClick={() => onPick(day)}
              className={cn(
                'mx-auto grid size-9 cursor-pointer place-items-center rounded-full text-sm tabular-nums transition-colors duration-200 outline-offset-1 focus-visible:outline-2 focus-visible:outline-ink',
                chosen
                  ? 'bg-button text-button-text'
                  : inMonth
                    ? 'text-ink hover:bg-ink/7'
                    : 'text-faint/70 hover:bg-ink/5',
                !chosen && day === now && 'ring-1 ring-inset ring-ink/30',
                outside && 'pointer-events-none opacity-30',
              )}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
