import { Search } from 'lucide-react';
import type { ComponentProps } from 'react';
import { cn } from '@/shared/lib/cn';
import { smallInputText } from './fieldStyles';

// The field at the top of a list that opens (a Select's, a list of places)
// to narrow it down by typing; the field's own attributes passed through
export function PopoverSearch({
  className,
  ...input
}: ComponentProps<'input'>) {
  return (
    <label className={cn('flex shrink-0 items-center gap-2', className)}>
      <Search size={14} className='shrink-0 text-faint' />
      <input
        {...input}
        className={cn(
          'min-w-0 flex-1 bg-transparent text-ink outline-none placeholder:text-faint',
          smallInputText,
        )}
      />
    </label>
  );
}
