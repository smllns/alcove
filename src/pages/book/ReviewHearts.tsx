import { Heart } from 'lucide-react';
import { useHeartsOnMine } from '@/entities/reader/reviewQueries';
import { callName } from '@/entities/user/types';
import { paths } from '@/shared/config/paths';
import { counted } from '@/shared/lib/plural';
import { TransitionLink } from '@/shared/ui/TransitionLink';

// How many have the most named
const NAMED = 2;

// Under the reader's own review, the hearts other readers gave it: how
// many, and who (the latest few by name, each a way to their page); none
// given, nothing. Shown only once there's a review.
export function ReviewHearts({ bookId }: { bookId: string }) {
  const { data } = useHeartsOnMine(bookId);
  if (!data?.likes) return null;
  const named = data.readers.slice(0, NAMED);
  const rest = data.likes - named.length;
  return (
    <p className='mt-3 flex animate-fade-in flex-wrap items-center gap-x-1.5 gap-y-1 text-sm text-muted'>
      <Heart size={16} className='fill-danger text-danger' aria-hidden />
      <span className='sr-only'>Liked by</span>
      {named.map((reader, i) => (
        <span key={reader.username}>
          <TransitionLink
            to={paths.reader(reader.username)}
            className='text-ink hover:underline'
          >
            {callName(reader)}
          </TransitionLink>
          {i < named.length - 1 ? (rest > 0 ? ',' : ' and') : ''}
        </span>
      ))}
      {rest > 0 && <span>and {counted(rest, 'other')}</span>}
      <span>liked it</span>
    </p>
  );
}
