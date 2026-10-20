import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { softClass } from './buttonStyles';
import { CalendarDays } from './CalendarDays';
import {
  addDays,
  addMonths,
  fromDay,
  monthName,
  toDay,
  today,
} from '@/shared/lib/dates';

const YEARS = 12;

const step = softClass(
  false,
  'grid size-8 place-items-center disabled:pointer-events-none disabled:opacity-30',
);

// A month of days to pick one from, opening on the chosen day (or today).
// The month name opens a grid of years, for days long past. Arrow keys move
// a day or a week, Page Up and Down a month, Enter picks. Given `earliest`
// or `latest`, nothing outside them can be picked, or even moved to.
export function Calendar({
  value,
  onPick,
  earliest,
  latest,
}: {
  value: string;
  // '' to clear
  onPick: (day: string) => void;
  earliest?: string;
  latest?: string;
}) {
  const first = earliest ? fromDay(earliest) : null;
  const last = latest ? fromDay(latest) : null;
  const within = (date: Date) =>
    last && date > last ? last : first && date < first ? first : date;
  const [focus, setFocusAnywhere] = useState(() =>
    within(fromDay(value) ?? new Date()),
  );
  const setFocus = (date: Date) => setFocusAnywhere(within(date));
  const [years, setYears] = useState(false);
  const grid = useRef<HTMLDivElement>(null);
  const focusDay = toDay(focus);

  // Keyboard focus follows the focused day as it moves
  useEffect(() => {
    grid.current
      ?.querySelector<HTMLElement>(`[data-day="${focusDay}"]`)
      ?.focus({ preventScroll: true });
  }, [focusDay, years]);

  const onKeyDown = (e: KeyboardEvent) => {
    const moves: Record<string, () => Date> = {
      ArrowLeft: () => addDays(focus, -1),
      ArrowRight: () => addDays(focus, 1),
      ArrowUp: () => addDays(focus, -7),
      ArrowDown: () => addDays(focus, 7),
      PageUp: () => addMonths(focus, -1),
      PageDown: () => addMonths(focus, 1),
    };
    if (!moves[e.key]) return;
    e.preventDefault();
    setFocus(moves[e.key]());
  };

  const firstYear = focus.getFullYear() - (focus.getFullYear() % YEARS);
  // Whether there's anything to go back or forward to
  const earlier = years
    ? !first || firstYear > first.getFullYear()
    : !first || new Date(focus.getFullYear(), focus.getMonth(), 0) >= first;
  const later = years
    ? !last || firstYear + YEARS <= last.getFullYear()
    : !last || new Date(focus.getFullYear(), focus.getMonth() + 1, 1) <= last;

  return (
    <div className='p-3'>
      <div className='mb-2 flex items-center justify-between gap-2'>
        <button
          type='button'
          aria-label={years ? 'Earlier years' : 'Previous month'}
          onClick={() => setFocus(addMonths(focus, years ? -YEARS * 12 : -1))}
          disabled={!earlier}
          className={step}
        >
          <ChevronLeft size={16} />
        </button>
        <button
          type='button'
          onClick={() => setYears(!years)}
          aria-label={years ? 'Back to the days' : 'Choose a year'}
          className={softClass(
            false,
            'px-3 py-1 font-serif text-[17px] tracking-[-0.01em] text-ink!',
          )}
        >
          {years ? `${firstYear} – ${firstYear + YEARS - 1}` : monthName(focus)}
        </button>
        <button
          type='button'
          aria-label={years ? 'Later years' : 'Next month'}
          onClick={() => setFocus(addMonths(focus, years ? YEARS * 12 : 1))}
          disabled={!later}
          className={step}
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {years ? (
        <div className='grid grid-cols-3 gap-1 py-1'>
          {Array.from({ length: YEARS }, (_, i) => firstYear + i).map(
            (year) => (
              <button
                key={year}
                type='button'
                disabled={Boolean(
                  (last && year > last.getFullYear()) ||
                  (first && year < first.getFullYear()),
                )}
                onClick={() => {
                  setFocus(
                    new Date(
                      year,
                      focus.getMonth(),
                      Math.min(focus.getDate(), 28),
                    ),
                  );
                  setYears(false);
                }}
                className={cn(
                  'cursor-pointer rounded-full py-2.5 text-sm tabular-nums transition-colors duration-300 ease-soft disabled:pointer-events-none disabled:opacity-30',
                  year === focus.getFullYear()
                    ? 'bg-button text-button-text'
                    : 'text-ink-soft hover:bg-ink/6 hover:text-ink',
                )}
              >
                {year}
              </button>
            ),
          )}
        </div>
      ) : (
        <CalendarDays
          gridRef={grid}
          focus={focus}
          value={value}
          earliest={earliest}
          latest={latest}
          onKeyDown={onKeyDown}
          onPick={onPick}
        />
      )}

      <div className='mt-2 flex items-center justify-between border-t border-line/60 pt-2.5'>
        <button
          type='button'
          onClick={() => onPick(today())}
          className={softClass(false, 'px-3 py-1.5 text-sm')}
        >
          Today
        </button>
        {value && (
          <button
            type='button'
            onClick={() => onPick('')}
            className={softClass(false, 'px-3 py-1.5 text-sm')}
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
