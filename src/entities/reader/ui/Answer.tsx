import { useAnswer } from '../queries';
import { Button } from '@/shared/ui/Button';
import { FormError } from '@/shared/ui/FormError';

// A request to follow the reader, answered where it's shown (the feed,
// their own page): accepted (it becomes a follow) or declined (it's gone)
export function Answer({
  username,
  className,
}: {
  username: string;
  className?: string;
}) {
  const answer = useAnswer();
  const reply = (yes: boolean) => answer.mutate({ username, yes });
  return (
    <div className={className}>
      <div className='flex gap-2'>
        <Button
          variant='solidPill'
          onClick={() => reply(true)}
          disabled={answer.isPending}
        >
          Accept
        </Button>
        <Button
          variant='pill'
          onClick={() => reply(false)}
          disabled={answer.isPending}
        >
          Decline
        </Button>
      </div>
      <FormError
        message={answer.error?.message ?? null}
        small
        className='mt-1'
      />
    </div>
  );
}
