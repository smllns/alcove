import { Search } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { RemoveButton } from '@/shared/ui/ListControls';
import { floatingClass } from '@/shared/ui/surfaces';

// Searching the reader's own shelves: a capsule beside the view choices,
// with how many books match once there's something typed
export function BookSearch({
  value,
  onChange,
  found,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  // How many books match, once known
  found?: number;
  className?: string;
}) {
  return (
    <label
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
        placeholder='Search your books'
        aria-label='Search your books'
        className='min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-faint'
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
