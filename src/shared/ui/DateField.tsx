import { useId, useRef, useState } from 'react';
import { CalendarDays } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { fromDay, longDate, today } from '@/shared/lib/dates';
import { Calendar } from './Calendar';
import { Collapse } from './Collapse';
import { FieldNote } from './FieldNote';
import { labelClass } from './fieldStyles';
import { RemoveButton } from './ListControls';
import { Popover } from './Popover';

type DateFieldProps = {
  label: string;
  // 'YYYY-MM-DD', or '' for none
  value: string;
  onChange: (day: string) => void;
  error?: string;
  hint?: string;
  placeholder?: string;
  className?: string;
  // Only days that have already come: for things that have happened
  past?: boolean;
  // Nothing before this day, e.g. a finish before the start
  earliest?: string;
  // The calendar opening in the page under the field, rather than over
  // it: inside a dialog, which nothing drawn over the page can reach
  inline?: boolean;
};

// A day, picked from a calendar that opens below the field (over the page,
// or, `inline`, in it), and shown written out ("25 December 2019")
export function DateField({
  label,
  value,
  onChange,
  error,
  hint,
  placeholder = 'Pick a day',
  className,
  past = false,
  earliest,
  inline = false,
}: DateFieldProps) {
  const id = useId();
  const trigger = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const date = fromDay(value);

  const close = () => {
    setOpen(false);
    trigger.current?.focus();
  };
  const pick = (day: string) => {
    onChange(day);
    close();
  };

  const calendar = (
    <div role='dialog' aria-label={`Choose ${label.toLowerCase()}`}>
      <Calendar
        value={value}
        onPick={pick}
        earliest={earliest || undefined}
        latest={past ? today() : undefined}
      />
    </div>
  );

  return (
    <div className={cn('flex min-w-0 flex-col gap-2', className)}>
      <span id={`${id}-label`} className={labelClass}>
        {label}
      </span>
      <div
        className={cn(
          'flex items-center border-b transition-colors duration-500 ease-soft hover:border-ink',
          open ? 'border-ink' : error ? 'border-danger' : 'border-line',
        )}
      >
        <button
          ref={trigger}
          type='button'
          aria-haspopup='dialog'
          aria-expanded={open}
          aria-labelledby={`${id}-label ${id}-value`}
          aria-invalid={error ? true : undefined}
          onClick={() => setOpen(!open)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') {
              e.preventDefault();
              setOpen(true);
            }
          }}
          className='flex min-w-0 flex-1 cursor-pointer items-center gap-3 py-2 text-left text-base focus-visible:outline-none sm:py-2.5'
        >
          <CalendarDays size={16} className='shrink-0 text-faint' />
          <span
            id={`${id}-value`}
            className={cn('min-w-0 flex-1 truncate', !date && 'text-faint')}
          >
            {date ? longDate(date) : placeholder}
          </span>
        </button>
        {date && (
          <RemoveButton onClick={() => onChange('')} label={`Clear ${label}`} />
        )}
      </div>
      <FieldNote id={`${id}-note`} error={error} hint={hint} />

      {inline ? (
        <Collapse open={open}>
          <div className='max-w-76 pt-1'>{calendar}</div>
        </Collapse>
      ) : (
        <Popover
          open={open}
          anchor={trigger}
          onClose={(how) => (how === 'escape' ? close() : setOpen(false))}
          width={304}
        >
          {calendar}
        </Popover>
      )}
    </div>
  );
}
