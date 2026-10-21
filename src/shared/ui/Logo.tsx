import { cn } from '@/shared/lib/cn';
import { TransitionLink } from './TransitionLink';

// Leads home: the start page for guests, the library once signed in
export function Logo({
  className,
  to = '/',
}: {
  className?: string;
  to?: string;
}) {
  return (
    <TransitionLink
      to={to}
      transition='back'
      aria-label={to === '/' ? 'Alcove home' : 'My books'}
      className={cn(
        'text-glow font-serif text-xl tracking-[-0.04em] sm:text-2xl',
        className,
      )}
    >
      alcove<span className='text-accent'>.</span>
    </TransitionLink>
  );
}
