import { cn } from '@/shared/lib/cn';
import { isPlainClick } from '@/shared/lib/plainClick';
import { useGoBack } from '@/shared/lib/useGoBack';
import { ButtonLink } from './ButtonLink';

// "← Back" pill at the top of a page; leaves with the curtain. One that
// `returns` goes back the way the reader came, to the page as they left
// it, rather than on to `to` afresh. `className` in place of the usual room
// below it.
export function BackLink({
  to,
  returns = false,
  className = 'mb-7 sm:mb-10',
}: {
  to: string;
  returns?: boolean;
  className?: string;
}) {
  const goBack = useGoBack(to);
  return (
    <ButtonLink
      to={to}
      transition='back'
      variant='pill'
      back
      onClick={(e) => {
        if (!returns || !isPlainClick(e)) return;
        e.preventDefault();
        void goBack();
      }}
      className={cn('animate-rise', className)}
    >
      Back
    </ButtonLink>
  );
}
