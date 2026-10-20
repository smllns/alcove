import type { ReactNode } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { optionClass, type SelectOption } from './selectOptions';

// One choice in a Select's menu
export function Option<T extends string>({
  id,
  index,
  option,
  selected,
  active,
  onHover,
  onPick,
}: {
  id: string;
  index: number;
  option: SelectOption<T>;
  selected: boolean;
  active: boolean;
  onHover: () => void;
  onPick: () => void;
}): ReactNode {
  return (
    <li
      id={id}
      role='option'
      data-index={index}
      aria-selected={selected}
      onPointerMove={onHover}
      // Picked on press, before the focus moves away
      onPointerDown={(e) => e.preventDefault()}
      onClick={onPick}
      className={cn(
        optionClass,
        active && 'bg-ink/6',
        option.muted ? 'text-muted' : 'text-ink',
      )}
    >
      <span className='min-w-0 flex-1'>{option.label}</span>
      {selected && <Check size={15} className='shrink-0 text-ink-soft' />}
    </li>
  );
}
