import { cn } from '@/shared/lib/cn';
import { TransitionLink } from './TransitionLink';

export function Logo({ className }: { className?: string }) {
  return (
    <TransitionLink
      to='/'
      transition='back'
      aria-label='Alcove home'
      className={cn(
        'text-glow font-serif text-xl tracking-[-0.04em] sm:text-2xl',
        className,
      )}
    >
      alcove<span className='text-accent'>.</span>
    </TransitionLink>
  );
}
