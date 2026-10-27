import { Search } from 'lucide-react';
import type { Ref } from 'react';
import { cn } from '@/shared/lib/cn';
import { smallInputText } from '@/shared/ui/fieldStyles';
import { RemoveButton } from '@/shared/ui/ListControls';
import { floatingClass } from '@/shared/ui/surfaces';

// Searching the reader's own books: a capsule (beside the shelf's view
// choices, over the places), with how many books match once there's
// something typed, if that's given. `ref`: for what it opens to sit by.
export function BookSearch({
  value,
  onChange,
  found,
  placeholder = 'Search your books',
  onFocus,
  ref,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  // How many books match, once known
  found?: number;
  placeholder?: string;
  onFocus?: () => void;
  ref?: Ref<HTMLLabelElement>;
  className?: string;
}) {
  return (
    <label
      ref={ref}
      className={cn(
        'flex h-10 animate-rise items-center gap-2 rounded-full pl-3.5 pr-1 transition-[border-color,width] duration-500 ease-soft focus-within:border-ink/40 sm:focus-within:w-80',
        floatingClass,
        className,
      )}
    >
      <Search size={15} className='shrink-0 text-muted' />
      <input
        type='search'
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === 'Escape' && onChange('')}
        onFocus={onFocus}
        placeholder={placeholder}
        aria-label={placeholder}
        className={cn(
          'min-w-0 flex-1 bg-transparent text-ink outline-none placeholder:text-faint',
          smallInputText,
        )}
      />
      {value && found !== undefined && (
        <span className='shrink-0 text-xs tabular-nums text-faint'>
          {found}
        </span>
      )}
      {value ? (
        <RemoveButton onClick={() => onChange('')} label='Clear search' />
      ) : (
        // Holds the same room, so the field doesn't jump when typing starts
        <span className='size-7 shrink-0' />
      )}
    </label>
  );
}
