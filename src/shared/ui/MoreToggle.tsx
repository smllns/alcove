import type { ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { QuietButton } from './ListControls';

// "Read more" under something folded away, with an arrow saying which way
// it goes: down to open out the rest, turned up to fold it back; its words
// fading in afresh as they change
export function MoreToggle({
  open,
  onClick,
  className,
  children,
}: {
  open: boolean;
  onClick: () => void;
  className?: string;
  children: ReactNode;
}) {
  return (
    <QuietButton onClick={onClick} className={className}>
      <span key={String(open)} className='animate-fade-in'>
        {children}
      </span>
      <ChevronDown
        size={15}
        aria-hidden
        className={cn(
          'transition-transform duration-500 ease-soft',
          open && 'rotate-180',
        )}
      />
    </QuietButton>
  );
}
