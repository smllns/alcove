import type { ReaderPage } from '@/entities/reader/types';
import { useFollow } from '@/entities/reader/queries';
import { Button } from '@/shared/ui/Button';
import { FormError } from '@/shared/ui/FormError';

// Following another reader, or no longer: Follow (Ask to follow, for a
// page they open only to those they let in); once followed, Following,
// turning to Unfollow as it's pointed at; once asked, Asked, turning to
// Cancel
export function FollowButton({
  page,
  className,
}: {
  page: ReaderPage;
  className?: string;
}) {
  const follow = useFollow(page.username);
  const state = page.follow;
  const swap = (now: string, then: string) => (
    <>
      <span className='group-hover:hidden'>{now}</span>
      <span className='hidden group-hover:inline'>{then}</span>
    </>
  );
  return (
    <div className={className}>
      <Button
        variant={state === 'none' ? 'primary' : 'secondary'}
        loading={follow.isPending}
        onClick={() => follow.mutate(state === 'none')}
        className='w-full lg:w-auto lg:min-w-36'
      >
        {state === 'following'
          ? swap('Following', 'Unfollow')
          : state === 'asked'
            ? swap('Asked', 'Cancel')
            : page.open
              ? 'Follow'
              : 'Ask to follow'}
      </Button>
      <FormError
        message={follow.error?.message ?? null}
        small
        className='mt-2'
      />
    </div>
  );
}
