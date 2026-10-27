import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { FieldNote } from './FieldNote';
import { labelClass } from './fieldStyles';
import { Popover } from './Popover';
import { PopoverSearch } from './PopoverSearch';
import { Option } from './SelectOption';
import { jumpTo, type SelectOption } from './selectOptions';

export type { SelectOption };

type SelectProps<T extends string> = {
  label: string;
  value: T | '';
  options: SelectOption<T>[];
  onChange: (value: T) => void;
  // Shown while nothing is chosen
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  hint?: string;
  // A box to narrow a long list down by typing; on by default past a dozen
  searchable?: boolean;
  className?: string;
};

// A menu of choices dressed like the other fields: small caps label, an
// underline, and a panel of options that opens below. Arrow keys move,
// Enter picks, Escape closes; typing a letter jumps to it, or narrows the
// list when there's a search box.
export function Select<T extends string>({
  label,
  value,
  options,
  onChange,
  placeholder = 'Choose…',
  disabled = false,
  error,
  hint,
  searchable = options.length > 12,
  className,
}: SelectProps<T>) {
  const id = useId();
  const trigger = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const search = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);

  const words = query.trim().toLowerCase();
  const shown = words
    ? options.filter((o) => o.label.toLowerCase().includes(words))
    : options;
  const chosen = options.find((o) => o.value === value);

  const openMenu = () => {
    if (disabled) return;
    setQuery('');
    setActive(
      Math.max(
        0,
        options.findIndex((o) => o.value === value),
      ),
    );
    setOpen(true);
  };
  const close = () => {
    setOpen(false);
    trigger.current?.focus();
  };
  const pick = (option: SelectOption<T> | undefined) => {
    if (!option) return;
    onChange(option.value);
    close();
  };

  // Into the menu as it opens; the active option kept in view
  useEffect(() => {
    if (open) (search.current ?? list.current)?.focus();
  }, [open]);
  useEffect(() => {
    if (!open) return;
    list.current
      ?.querySelector(`[data-index="${active}"]`)
      ?.scrollIntoView({ block: 'nearest' });
  }, [open, active]);

  const onListKey = (e: KeyboardEvent) => {
    const last = shown.length - 1;
    const moves: Record<string, () => void> = {
      ArrowDown: () => setActive((i) => Math.min(i + 1, last)),
      ArrowUp: () => setActive((i) => Math.max(i - 1, 0)),
      Home: () => setActive(0),
      End: () => setActive(last),
      Enter: () => pick(shown[active]),
      Tab: () => setOpen(false),
    };
    if (moves[e.key]) {
      if (e.key !== 'Tab') e.preventDefault();
      moves[e.key]();
      return;
    }
    if (!searchable) {
      const next = jumpTo(shown, e.key, active);
      if (next !== null) setActive(next);
    }
  };

  return (
    <div className={cn('flex min-w-0 flex-col gap-2', className)}>
      <span id={`${id}-label`} className={labelClass}>
        {label}
      </span>
      <button
        ref={trigger}
        type='button'
        disabled={disabled}
        aria-haspopup='listbox'
        aria-expanded={open}
        aria-labelledby={`${id}-label ${id}-value`}
        aria-invalid={error ? true : undefined}
        onClick={() => (open ? setOpen(false) : openMenu())}
        onKeyDown={(e) => {
          if (['ArrowDown', 'ArrowUp'].includes(e.key)) {
            e.preventDefault();
            openMenu();
          }
        }}
        className={cn(
          'flex w-full cursor-pointer items-center gap-3 border-b py-2 text-left text-base transition-colors duration-500 ease-soft hover:border-ink focus-visible:border-ink focus-visible:outline-none disabled:cursor-default disabled:opacity-60 sm:py-2.5',
          open ? 'border-ink' : error ? 'border-danger' : 'border-line',
        )}
      >
        <span
          id={`${id}-value`}
          className={cn('min-w-0 flex-1 truncate', !chosen && 'text-faint')}
        >
          {chosen?.label ?? placeholder}
        </span>
        <ChevronDown
          size={16}
          className={cn(
            'shrink-0 text-faint transition-transform duration-300 ease-soft',
            open && 'rotate-180',
          )}
        />
      </button>
      <FieldNote id={`${id}-note`} error={error} hint={hint} />

      <Popover
        open={open}
        anchor={trigger}
        onClose={(how) => (how === 'escape' ? close() : setOpen(false))}
        className='min-w-56'
      >
        {searchable && (
          <PopoverSearch
            ref={search}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={onListKey}
            placeholder='Type to narrow down'
            aria-label={`Search ${label.toLowerCase()}`}
            aria-controls={`${id}-list`}
            aria-activedescendant={`${id}-${active}`}
            className='border-b border-line/60 px-3.5 py-2.5'
          />
        )}
        <ul
          ref={list}
          id={`${id}-list`}
          role='listbox'
          tabIndex={-1}
          aria-labelledby={`${id}-label`}
          aria-activedescendant={`${id}-${active}`}
          onKeyDown={onListKey}
          className='min-h-0 flex-1 overflow-y-auto overscroll-contain p-1.5 outline-none'
        >
          {shown.map((option, i) => (
            <Option
              key={option.value}
              id={`${id}-${i}`}
              index={i}
              option={option}
              selected={option.value === value}
              active={i === active}
              onHover={() => setActive(i)}
              onPick={() => pick(option)}
            />
          ))}
          {!shown.length && (
            <li className='px-3 py-2.5 text-sm text-muted'>
              Nothing matches “{query.trim()}”.
            </li>
          )}
        </ul>
      </Popover>
    </div>
  );
}
