import { Search } from 'lucide-react';
import { useEffect, useRef, type Ref } from 'react';
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
  onBlur,
  grows = true,
  focus = false,
  ref,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  // How many books match, once known
  found?: number;
  placeholder?: string;
  onFocus?: () => void;
  onBlur?: () => void;
  // Wider while typed in, beside the shelf's view choices; not where it
  // has the width it needs all along
  grows?: boolean;
  // The cursor in it as it opens, the page not jumping to it
  focus?: boolean;
  ref?: Ref<HTMLLabelElement>;
  className?: string;
}) {
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (focus) input.current?.focus({ preventScroll: true });
    // Only as it opens
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <label
      ref={ref}
      className={cn(
        'flex h-10 animate-rise cursor-text items-center gap-2 rounded-full pl-3.5 pr-1 transition-[border-color,width] duration-500 ease-soft hover:border-ink/40 focus-within:border-ink/40',
        grows && 'sm:focus-within:w-80',
        floatingClass,
        className,
      )}
    >
      <Search size={15} className='shrink-0 text-muted' />
      <input
        ref={input}
        type='search'
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === 'Escape' && onChange('')}
        onFocus={onFocus}
        onBlur={onBlur}
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
