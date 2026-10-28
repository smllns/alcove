import { Search } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { Kbd } from '@/shared/ui/Kbd';
import { floatingClass } from '@/shared/ui/surfaces';

// The search over everything, always in sight in the header as a line to
// type in; a click opens it over the page
export function HeaderSearch({
  onOpen,
  className,
}: {
  onOpen: () => void;
  className?: string;
}) {
  return (
    <button
      type='button'
      onClick={onOpen}
      className={cn(
        'flex h-10 animate-rise cursor-pointer items-center gap-2 rounded-full pl-3.5 pr-2 text-sm text-faint transition-colors duration-500 ease-soft hover:border-ink/40',
        floatingClass,
        className,
      )}
    >
      <Search size={15} className='shrink-0 text-muted' />
      <span className='flex-1 truncate text-left'>Books, readers, authors</span>
      <Kbd>⌘K</Kbd>
    </button>
  );
}
