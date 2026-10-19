import { cn } from '@/shared/lib/cn';
import { ButtonLink } from './ButtonLink';

// "← Back" pill at the top of a page; leaves with the curtain
export function BackLink({
  to,
  className,
}: {
  to: string;
  className?: string;
}) {
  return (
    <ButtonLink
      to={to}
      transition='back'
      variant='pill'
      back
      className={cn('mb-7 animate-rise sm:mb-10', className)}
    >
      Back
    </ButtonLink>
  );
}
