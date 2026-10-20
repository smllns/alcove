import { useRef, useState, type ReactNode } from 'react';
import { ArrowDownUp, Check } from 'lucide-react';
import { flushSync } from 'react-dom';
import { cn } from '@/shared/lib/cn';
import { softClass } from '@/shared/ui/buttonStyles';
import { labelClass } from '@/shared/ui/fieldStyles';
import { Popover } from '@/shared/ui/Popover';
import { optionClass } from '@/shared/ui/selectOptions';
import { capsuleClass } from '@/shared/ui/surfaces';
import {
  fades,
  orders,
  type Arrangement,
  type ShelfFade,
  type ShelfOrder,
} from './order';

// One group of choices in the menu, the chosen one ticked (or marked
// with `chosenMark`)
function Group<T extends string>({
  label,
  options,
  current,
  onPick,
  chosenMark = <Check size={15} />,
}: {
  label: string;
  options: { value: T; label: string }[];
  current: T;
  onPick: (value: T) => void;
  chosenMark?: ReactNode;
}) {
  return (
    <div role='group' aria-label={label} className='p-1.5'>
      <p className={cn('px-3 pb-1.5 pt-2', labelClass)}>{label}</p>
      {options.map((option) => {
        const on = option.value === current;
        return (
          <button
            key={option.value}
            type='button'
            role='menuitemradio'
            aria-checked={on}
            onClick={() => onPick(option.value)}
            className={cn(
              optionClass,
              'group/row text-ink hover:bg-ink/6 focus-visible:bg-ink/6 focus-visible:outline-none',
            )}
          >
            <span className='flex-1'>{option.label}</span>
            {on && (
              <span className='flex items-center gap-1.5 text-xs text-ink-soft'>
                {chosenMark}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// How the grid and the list are ordered, and what fades back: a small
// capsule by the view choices, opening a menu of both. Picking the order
// already chosen turns it the other way round.
export function ShelfOrderMenu({
  arrangement: { order, reversed, fade },
  onOrder,
  onFade,
}: {
  arrangement: Arrangement;
  onOrder: (order: ShelfOrder, reversed: boolean) => void;
  onFade: (fade: ShelfFade) => void;
}) {
  const trigger = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const chosen = orders.find((o) => o.value === order) ?? orders[0];
  const label = chosen.label;
  const way = chosen.ways[reversed ? 1 : 0];

  return (
    <div className={cn('flex animate-rise', capsuleClass)}>
      <button
        ref={trigger}
        type='button'
        aria-haspopup='menu'
        aria-expanded={open}
        aria-label={`Order: ${label}, ${way}`}
        onClick={() => setOpen(!open)}
        className={softClass(
          open || order !== 'added' || reversed || fade !== 'none',
          'flex h-8 items-center gap-2 px-3 text-xs font-medium',
        )}
      >
        <ArrowDownUp size={14} />
        <span className='max-sm:hidden'>
          {label} <span className='text-faint'>{way}</span>
        </span>
      </button>
      <Popover
        open={open}
        anchor={trigger}
        width={248}
        onClose={(how) => {
          setOpen(false);
          if (how === 'escape') trigger.current?.focus();
        }}
      >
        <div
          role='menu'
          aria-label='Order and fade'
          className='divide-y divide-line/60'
        >
          <Group
            label='Order by'
            options={orders}
            current={order}
            // The way round, as a pill of its own that answers the
            // pointer, to show it can be turned
            chosenMark={
              <span className='flex items-center gap-1.5 rounded-full bg-surface px-2.5 py-1 ring-1 ring-line transition-[background-color,box-shadow,color] duration-300 ease-soft group-hover/row:bg-button group-hover/row:text-button-text group-hover/row:ring-button'>
                {way}
                <ArrowDownUp
                  size={12}
                  aria-hidden
                  className='transition-transform duration-500 ease-soft group-hover/row:rotate-180'
                />
              </span>
            }
            onPick={(next) => {
              // The chosen one turns round; another starts the usual way
              // round. Either way the menu is gone before the books start
              // moving, rather than fading out with them.
              flushSync(() => setOpen(false));
              onOrder(next, next === order && !reversed);
            }}
          />
          <Group
            label='Fade back'
            options={fades}
            current={fade}
            onPick={(next) => {
              setOpen(false);
              onFade(next);
            }}
          />
        </div>
      </Popover>
    </div>
  );
}
