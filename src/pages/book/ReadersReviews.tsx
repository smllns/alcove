import { useState } from 'react';
import { Heart } from 'lucide-react';
import type { Book } from '@/entities/book/types';
import { useLikeReview, useReviews } from '@/entities/reader/reviewQueries';
import type { ReaderReview } from '@/entities/reader/types';
import { callName, handle } from '@/entities/user/types';
import { paths } from '@/shared/config/paths';
import { cn } from '@/shared/lib/cn';
import { longDate } from '@/shared/lib/dates';
import { counted } from '@/shared/lib/plural';
import { Fold } from '@/shared/ui/Fold';
import { MoreToggle } from '@/shared/ui/MoreToggle';
import { halves } from '@/shared/lib/halves';
import { Avatar } from '@/shared/ui/Avatar';
import { Stars } from '@/shared/ui/Stars';
import { TitledSection } from '@/shared/ui/TitledSection';
import { TransitionLink } from '@/shared/ui/TransitionLink';

// How many show before the rest are asked for
const FIRST = 3;

// What other readers of alcove wrote of the book (as Goodreads shows its
// readers'): each with who wrote it (a way to their page), their stars and
// when, a long one folded to its first lines, and its hearts, one given
// or taken back with a tap; the most liked first (then the latest), a few
// of them, the rest a tap away. None written, nothing here.
export function ReadersReviews({ book }: { book: Book }) {
  const reviews = useReviews({
    work: book.openLibrary?.work,
    title: book.title,
    author: book.authors[0],
  });
  const [all, setAll] = useState(false);
  const found = reviews.data ?? [];
  if (!found.length) return null;
  const shown = all ? found : found.slice(0, FIRST);
  return (
    <TitledSection
      title='Reviews'
      aside={
        <span className='text-[0.8125rem] text-muted'>
          {counted(found.length, 'review')}
        </span>
      }
    >
      <ul className='flex flex-col divide-y divide-line/70'>
        {shown.map((each) => (
          <Review key={each.reader.username} review={each} />
        ))}
      </ul>
      {found.length > FIRST && (
        <MoreToggle
          open={all}
          onClick={() => setAll((was) => !was)}
          className='mt-4'
        >
          {all ? 'Show fewer' : `Show all ${counted(found.length, 'review')}`}
        </MoreToggle>
      )}
    </TitledSection>
  );
}

// One reader's review, as a journal sets one: their photo in the margin;
// beside it who wrote it with the stars they gave, and under that their
// @username and when; then the review, and its hearts under it
function Review({ review }: { review: ReaderReview }) {
  const to = paths.reader(review.reader.username);
  const name = callName(review.reader);
  return (
    <li className='grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 py-6 first:pt-1 sm:gap-x-5'>
      <TransitionLink
        to={to}
        aria-hidden
        tabIndex={-1}
        className='transition-opacity duration-300 ease-soft hover:opacity-80'
      >
        <Avatar name={name} url={review.reader.avatarUrl} size='md' />
      </TransitionLink>
      <div className='flex min-w-0 flex-col'>
        <div className='flex flex-wrap items-center gap-x-3 gap-y-1'>
          <TransitionLink
            to={to}
            className='font-serif text-[1.125rem] leading-tight text-ink underline-offset-4 hover:underline'
          >
            {name}
          </TransitionLink>
          {review.rating && (
            <>
              <Stars value={review.rating} size={15} className='-mx-0.5' />
              <span className='sr-only'>
                {halves(review.rating)} stars of 5
              </span>
            </>
          )}
        </div>
        <p className='mt-1 text-xs text-muted'>
          {review.reader.name && <>{handle(review.reader.username)} · </>}
          {longDate(new Date(review.at))}
        </p>
        <Fold
          lines={5}
          className='mt-3 font-serif text-[1.0625rem] leading-relaxed text-ink-soft'
        >
          <p className='whitespace-pre-line'>{review.review}</p>
        </Fold>
        <Hearts review={review} />
      </div>
    </li>
  );
}

// A review's hearts: the reader's own given or taken back, and how many
function Hearts({ review }: { review: ReaderReview }) {
  const like = useLikeReview();
  return (
    <button
      type='button'
      aria-pressed={review.liked}
      aria-label={`${review.liked ? 'Unlike' : 'Like'} ${callName(review.reader)}’s review`}
      onClick={() => like.mutate({ id: review.id, on: !review.liked })}
      className='group/heart mt-3 -ml-1 flex w-fit cursor-pointer items-center gap-2 rounded-full py-1 pl-1 pr-2.5 text-sm text-muted transition-colors duration-300 ease-soft hover:text-ink focus-visible:outline-2 focus-visible:outline-ink'
    >
      <Heart
        size={20}
        strokeWidth={1.6}
        className={cn(
          'transition-transform duration-300 ease-soft group-active/heart:scale-90',
          review.liked
            ? 'fill-danger text-danger'
            : 'group-hover/heart:text-danger',
        )}
      />
      <span className='tabular-nums'>
        {review.likes ? counted(review.likes, 'like') : 'Like'}
      </span>
    </button>
  );
}
