import { useId, useRef, useState } from 'react';
import { CalendarDays } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { fromDay, longDate, parseDay, today } from '@/shared/lib/dates';
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

// A day, typed (as parseDay reads it: "25 December 2019", "25/12/19") or
// picked from a calendar that opens below the field (over the page, or,
// `inline`, in it) as it's typed in, or from the sign at its start, and
// shown written out ("25 December 2019"). While typing, the calendar turns
// to the day typed as soon as it reads as one. What's typed is taken as
// the field's left or Enter pressed; not a day, or one out of range, it
// stays to be put right, and says why.
export function DateField({
  label,
  value,
  onChange,
  error,
  hint,
  placeholder = '25 Dec 2019 or 25/12/2019',
  className,
  past = false,
  earliest,
  inline = false,
}: DateFieldProps) {
  const id = useId();
  const row = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  // What's being typed, while it is (or while it's to be put right)
  const [draft, setDraft] = useState<string | null>(null);
  const [problem, setProblem] = useState<string>();
  const date = fromDay(value);
  const latest = past ? today() : undefined;
  // The day being typed, once it reads as one, for the calendar to show
  const typed = draft === null ? null : parseDay(draft);

  const take = (day: string) => {
    setDraft(null);
    setProblem(undefined);
    onChange(day);
  };
  const close = () => {
    setOpen(false);
    trigger.current?.focus();
  };
  const pick = (day: string) => {
    take(day);
    close();
  };
  // What's typed, as the day it is, or why it isn't one to take
  const commit = () => {
    if (draft === null) return;
    if (!draft.trim()) return take('');
    const day = parseDay(draft);
    if (!day)
      return setProblem('Type a day like 25 December 2019, or pick one.');
    if (latest && day > latest) return setProblem('That day is still to come.');
    if (earliest && day < earliest)
      return setProblem(`It can’t be before ${longDate(fromDay(earliest)!)}.`);
    take(day);
  };

  const calendar = (
    <div ref={panel} role='dialog' aria-label={`Choose ${label.toLowerCase()}`}>
      <Calendar
        value={typed ?? value}
        onPick={pick}
        quiet
        earliest={earliest || undefined}
        latest={latest}
      />
    </div>
  );

  return (
    <div className={cn('flex min-w-0 flex-col gap-2', className)}>
      <span id={`${id}-label`} className={labelClass}>
        {label}
      </span>
      <div
        ref={row}
        className={cn(
          'flex items-center gap-3 border-b transition-colors duration-500 ease-soft hover:border-ink focus-within:border-ink',
          open
            ? 'border-ink'
            : error || problem
              ? 'border-danger'
              : 'border-line',
        )}
      >
        <button
          ref={trigger}
          type='button'
          aria-haspopup='dialog'
          aria-expanded={open}
          aria-label={`Choose ${label.toLowerCase()} from a calendar`}
          onClick={() => setOpen(!open)}
          className='-my-1 shrink-0 cursor-pointer py-1 text-faint transition-colors duration-300 hover:text-ink focus-visible:text-ink focus-visible:outline-none'
        >
          <CalendarDays size={16} />
        </button>
        <input
          type='text'
          aria-labelledby={`${id}-label`}
          aria-describedby={`${id}-note`}
          aria-invalid={error || problem ? true : undefined}
          value={draft ?? (date ? longDate(date) : '')}
          placeholder={placeholder}
          autoComplete='off'
          onFocus={() => {
            if (draft === null) setDraft(date ? longDate(date) : '');
            setOpen(true);
          }}
          onChange={(e) => {
            setDraft(e.target.value);
            setProblem(undefined);
          }}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              // Taken, not the form sent
              e.preventDefault();
              commit();
            } else if (e.key === 'ArrowDown') {
              // Down into the calendar, to go on by the arrows there
              e.preventDefault();
              setOpen(true);
              panel.current
                ?.querySelector<HTMLElement>('[data-day][tabindex="0"]')
                ?.focus();
            } else if (e.key === 'Escape' || e.key === 'Tab') {
              setOpen(false);
            }
          }}
          className='min-w-0 flex-1 bg-transparent py-2 text-base text-ink outline-none placeholder:text-faint sm:py-2.5'
        />
        {date && (
          <RemoveButton onClick={() => take('')} label={`Clear ${label}`} />
        )}
      </div>
      <FieldNote id={`${id}-note`} error={problem ?? error} hint={hint} />

      {inline ? (
        <Collapse open={open}>
          <div className='max-w-76 pt-1'>{calendar}</div>
        </Collapse>
      ) : (
        <Popover
          open={open}
          anchor={row}
          onClose={(how) => (how === 'escape' ? close() : setOpen(false))}
          width={304}
        >
          {calendar}
        </Popover>
      )}
    </div>
  );
}
